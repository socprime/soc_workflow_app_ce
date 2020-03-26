# Output backends for sigmac
# Copyright 2016-2018 Thomas Patzke, Florian Roth, Devin Ferguson, Julien Bachmann

# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU Lesser General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.

# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU Lesser General Public License for more details.

# You should have received a copy of the GNU Lesser General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.

import json
import re
import sigma
import yaml

from .elasticsearch import ElasticsearchQuerystringBackend
#from .base import BaseBackend, SingleTextQueryBackend
from .mixins import MultiRuleOutputMixin
#from .exceptions import NotSupportedError


class XPackWatcherSPBackend(ElasticsearchQuerystringBackend, MultiRuleOutputMixin):
    """Converts Sigma Rule into X-Pack Watcher JSON for alerting. SOC prime edition"""
    identifier = "xpack-watcher-sp"
    active = True
##    options = ElasticsearchQuerystringBackend.options + (
##            #("output", "curl", "Output format: curl = Shell script that imports queries in Watcher index with curl", "output_type"),
##            #("es", "localhost:9200", "Host and port of Elasticsearch instance", None),
##            ("kibana", "localhost:5601", "Host and port of Kibana instance", "kibana_host"),
##            ("index_uid", "PUT IN HERE ECS INDEX UID", "uid of ECS index", "index_uid"),
##            #("mail", None, "Mail address for Watcher notification (only logging if not set)", None),
##            )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.watcher_alert = dict()

    def generate(self, sigmaparser):
        # get the details if this alert occurs
        rulename = self.getRuleName(sigmaparser)
        title = sigmaparser.parsedyaml.setdefault("title", "")
        description = sigmaparser.parsedyaml.setdefault("description", "")
        references = sigmaparser.parsedyaml.setdefault("references", "")
        #false_positives = sigmaparser.parsedyaml.setdefault("falsepositives", "")
        #level = sigmaparser.parsedyaml.setdefault("level", "")
        # Get time frame if exists
        interval = 10 #sigmaparser.parsedyaml["detection"].setdefault("timeframe", "10m")

        # creating condition
        indices = sigmaparser.get_logsource().index
        
##        message = "title: {title}\ndescription: {description}\nreferences: {references}"#\nquery: {query}'
##        message.format(
##                title=title,
##                description=description,
##                references=references
##                #query=result
##                )
        message = [
            "title: {}".format(title),
            "description: {}".format(description),
            "references: {}".format(', '.join(['<a href="{}">link_{}</a>'.format(x,i+1) for i,x in enumerate(references)])),
            ]
        message = '<br/>'.join(message)
        #print(message)

        for condition in sigmaparser.condparsed:
            result = self.generateNode(condition.parsedSearch)

            actions = {
                "index_payload": {
                  "condition": {
                    "always": {}
                  },
                  "transform": {
                    "chain": [
                      {
                        "script": {
                          "source": "def id_list = []; id_list = ctx.payload.main.hits.hits.stream().map(b -> b._id).collect(Collectors.toList()); def execDT = Instant.ofEpochMilli(ctx.execution_time.getMillis()); def startDT = execDT.minus(ctx.metadata.interval_int, ChronoUnit.MINUTES); def endDT = execDT.plus(ctx.metadata.interval_int, ChronoUnit.MINUTES); String enc_query = String.join('\" \"', id_list); enc_query = '_id:(\"' +enc_query +'\")';enc_query=enc_query.replace(' ','%20');enc_query=enc_query.replace('\"','%22'); enc_query=enc_query.replace('\\\\','%5C'); String discover_url = ctx.metadata.kibana_host+'/app/kibana#/discover?_g=(refreshInterval:(pause:!t,value:0),time:(from:\\'' + startDT + '\\',absolute:quick,to:\\'' + endDT + '\\'))&_a=(columns:!(_source),index:\\''+ctx.metadata.index_uid+'\\',interval:auto,query:(language:lucene,query:\\'' + enc_query + '\\'),sort:!(\\'@timestamp\\',desc))'; return ['resource.URL': discover_url,'@timestamp': System.currentTimeMillis(), 'message': ctx.metadata.message, 'ecs_version' : '1.0.0','device.vendor' : 'SOCPrime','device.product': 'Sigma', 'event.type' : 'alert','event.severity' : '7','event.labels' : 'Queued','event.count': ctx.payload.main.hits.hits.length, 'event.timestamp': ctx.execution_time]",#.format(kibana_host="SET-KIBANA-HOST:5601", #self.kibana_host,
                  #     index_uid="SET-INDEX-PATTERN-ID" #self.index_uid
                  #      ),                 
                          "lang": "painless"
                        }
                      }
                    ]
                  },
                  "index": {
                    "index": "<alerts_ecs-{now/d}>",
                    "doc_type": "_doc"
            
                  }
                }
              }            
            

            self.watcher_alert[rulename] = {
                              "trigger": {
                                "schedule": {
                                  "interval": '{}m'.format(interval)  # how often the watcher should check
                                }
                              },
                              "input": {
                                    "chain": {
                                      "inputs": [
                                        {
                                          "main": {
                                            "search": {
                                              "request": {
                                                "search_type": "query_then_fetch",
                                                "indices": indices,#["<ecs-proxy-{now/d}>","*"],
                                                "types": [],
                                                "body": {
                                                  "query": {
                                                    "bool": {
                                                      "must": [
                                                        {
                                                          "query_string": {
                                                            "query": "{{ctx.metadata.query}}",
                                                            "analyze_wildcard": True
                                                          }
                                                        },
                                                        {
                                                          "range": {
                                                            "@timestamp": {
                                                              "gte": "{{ctx.metadata.interval}}"
                                                            }
                                                          }
                                                        }
                                                      ]
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      ]
                                    }
                                  },                                
                              "condition": {
                                  "compare": {
                                  "ctx.payload.main.hits.total": {
                                    "gt": 0
                                  }
                                }
                              },
                              "actions": { **actions },
                              "metadata": {
                                    "kibana_host":"https://SET-KIBANA-HOST:5601",
                                    "index_uid":"SET-INDEX-PATTERN-ID",                            
                                    "query": result,    # this is where the elasticsearch query syntax goes
                                    "interval": 'now-{}m'.format(interval),
                                    "interval_int": interval, #'now-{}m'.format(interval),
                                    "message": message
                                    }
                            }

    def finalize(self):
        result = ""
        for rulename, rule in self.watcher_alert.items():
            result += json.dumps(rule, indent=2) + "\n"  # indent!!!!!!!!!!!
        return result


