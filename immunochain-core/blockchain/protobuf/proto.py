import sys
import ntpath
import os 
import subprocess
from distutils.spawn import find_executable

CMD = "protoc -I={} --python_out={} {}"
OUTPUTDIR = "."

def stripFile(filePath):
    head, tail = ntpath.split(filePath)
    return head,tail

def checkProto(executable):
    if find_executable(executable) == None:
        return False
    else :
        return True

def installProto():
    Protoexist = checkProto("protoc")
    if Protoexist == True:
        print("Protobuf Already Installed")
    else:
        subprocess.run(["./proto.sh"])


if __name__ == '__main__':
    installProto()
    if(len(sys.argv) <= 1):
        print("Missing File ")
    else:

        if(len(sys.argv) == 3):
            outputDir = sys.argv[2]
        filePath = sys.argv[1]
        srcDir,inputFile = stripFile(filePath)
        os.system(CMD.format(srcDir,OUTPUTDIR,inputFile))

        