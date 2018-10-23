import sys

try:
    out_format = sys.argv[1]
    text = sys.argv[2]

except Exception as e:
    #print str(type(e))+ ': ' + str(e)
    print 'false'
    sys.exit(1)
else:
    print "translation from SIGMA to {}".format(out_format)