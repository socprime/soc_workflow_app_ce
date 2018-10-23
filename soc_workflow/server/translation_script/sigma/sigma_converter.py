import sys
import os, shutil, stat
import argparse
import time
import subprocess
##
##import zipfile
##import gzip
##import tarfile
##
##from lxml import etree
##import re
##import json

from logger import Logger
#from pm_db_connector import PM_DB_Connector



class Error(Exception):
    """Base class for exceptions in this module."""
    errors_dict = {
        10:{'db_code':1006, 'msg':'Unknown error'},
        1:{'db_code':1006, 'msg':'Running params error'},
        2:{'db_code':1006, 'msg':'File access error'},          ##2:[1,5]
        3:{'db_code':1006, 'msg':'Configuration error'},        ##3:[6,7,9]
        4:{'db_code':1001, 'msg':'Unsupported feature'},        ##4:[42]
        5:{'db_code':1004, 'msg':'Invalid format of YAML-file'},##5:[3],
        6:{'db_code':1005, 'msg':'Parsing error'},              ##6:[4,8]
        7:{'db_code':1006, 'msg':'Database access error'},
        8:{'db_code':1008, 'msg':'Partial Match Error'},        ##8:80
        9:{'db_code':1009, 'msg':'Full Mismatch Error'},        ##9:90
        }


##const CONST_SIGMA_CONVERTER_STATUS_IN_QUEUE = 2000;
##const CONST_SIGMA_CONVERTER_STATUS_IN_PROGRESS = 2001;
##const CONST_SIGMA_CONVERTER_STATUS_ERROR_INVALID_FORMAT_OF_YAML_FILE = 1004;
##const CONST_SIGMA_CONVERTER_STATUS_ERROR_PARSING = 1005;
##const CONST_SIGMA_CONVERTER_STATUS_ERROR_UNKNOWN = 1006;
##const CONST_SIGMA_CONVERTER_STATUS_ERROR_UNSUPPORTED_FEATURE = 1001; <<<<<<<
##const CONST_SIGMA_CONVERTER_STATUS_SUCCESS_ANALYSED = 3001;


    def __init__(self, error_code=0, msg=''):

        if not self.errors_dict.has_key(error_code):
            self.error_code = 0
        else:
            self.error_code = error_code

        self.db_error_code = self.errors_dict[error_code]['db_code']
        self.msg = self.errors_dict[error_code]['msg']

        if msg > '':
            self.msg = self.msg + ': ' + msg

    def __str__(self):
        return repr(self.msg)

def exec_shell_command(command):
    p = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p.wait()
##    if p.returncode == 2:
##        msg  = 'System returned an error while running the command: {0}'.format(p.stderr.read().strip())
##        raise Exception(msg)
    return (p.returncode, p.stdout.read().strip(), p.stderr.read().strip())


def get_options():
    opt = argparse.ArgumentParser(description='Sigma Converter')
    opt.add_argument('filepath')
    opt.add_argument('format')

    try:
        return opt.parse_args()
    except:
        raise Error(1)




def on_rm_error( func, path, exc_info):
    # path contains the path of the file that couldn't be removed
    # let's just assume that it's read-only and unlink it.
    os.chmod( path, stat.S_IWRITE )
    os.unlink( path )

# ###############################################################################
if __name__ == "__main__":

    currentdir = os.path.dirname(os.path.abspath(__file__))

    main_dir = os.path.normpath(currentdir) #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
##    main_dir = os.path.normpath('/srv/ucl/ucl_analyzer/')
##
##    content_dir = os.path.normpath(main_dir + '/rules/')
##    json_dir = os.path.normpath(main_dir + '/json/')
##    workdir = os.path.normpath(main_dir + '/workdir/')

    sigma_config_path = os.path.normpath(main_dir + '/tools/config/')
    converter_path = os.path.normpath(main_dir + '/tools/sigmac.py')


    logger = Logger('sigma_converter')
    logger.info('Script started ==============================')

    try:
        #dbc = PM_DB_Connector()
        opt = get_options()

        filepath = opt.filepath
        out_format = opt.format


    except Exception as e:
        logger.error(str(e))
        print str(type(e))+ ': ' + str(e)
        sys.exit(1)

    try:

        #filepath = dbc.get_file_name(record_id)


        #filename = 'application/app_python_sql_exceptions.yml' #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        #filepath = os.path.join(content_dir, filename) #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        #dbc.update_document_status('2001', record_id)

        try:
            exit_code = 0
            rezult = ''

            if out_format == 'as':
                sigma_config = '-c ' + os.path.normpath(sigma_config_path + '/arcsight.yml')
            elif out_format == 'qualys':
                sigma_config = '-c ' + os.path.normpath(sigma_config_path + '/qualys.yml')
            elif out_format == 'qradar':
                sigma_config = '-c ' + os.path.normpath(sigma_config_path + '/qradar.yml')    
            else:
                sigma_config = ''


            command = "/usr/bin/python3.6 {} {} -t {} {}".format(converter_path, sigma_config, out_format, filepath) #/usr/local/bin/python3.6
            logger.info(command)
            (exit_code, rezult, error_text) = exec_shell_command(command)

            logger.info('{}, {}'.format(str(exit_code), str(rezult)))



            if exit_code == 0:
##                values_list = (
##                    3001, #status
##                    rezult, #mesage
##                    record_id,
##                    )
##                dbc.update_document(values_list)
                print rezult #!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! exit

            elif exit_code in [1,5]:
                raise Error(2)
            elif exit_code in [6,7,9]:
                raise Error(3)
            elif exit_code == 42:
                raise Error(4)
            elif exit_code == 3:
                raise Error(5)
            elif exit_code in [4,8]:
                raise Error(6)
            elif exit_code == 80:
                raise Error(8)
            elif exit_code == 90:
                raise Error(9)
            else:
                raise Error(10)

        except Error as e:
            #dbc.update_document_status(e.db_error_code, record_id)
##            values_list = (
##                e.db_error_code, #status
##                error_text, #mesage
##                record_id,
##                )
##            dbc.update_document(values_list)
            logger.error(str(e) + ' ' + error_text)
            print str(e)
            sys.exit(e.db_error_code)

##        finally:
##            # чистим
##            package_workdir = os.path.normpath(os.path.join(workdir, str(record_id)))
##            if os.path.exists(package_workdir):
##                shutil.rmtree(package_workdir, onerror = on_rm_error)  #!!!!!!!!!!!!!!!!!!!!!!!!!!!
##            #pass

    except Error as e:
        #dbc.update_document_status(e.db_error_code, record_id)
        logger.error(str(e))
        print str(e)
        sys.exit(e.db_error_code)

    except Exception as e:
        #dbc.update_document_status(1006, record_id)
        logger.error(str(e))
        print str(e)
        sys.exit(10)
