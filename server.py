import http.server 
import os
import subprocess
import shutil
from PIL import Image
from PIL import UnidentifiedImageError
bhtr = http.server.BaseHTTPRequestHandler

def makeValidPath(path):
    path = "." + path
    return path

class handler(bhtr):
    def do_GET(self):
        self.send_response(200)
        if self.path[:3] == '/f/':
            f = ''
            for item in os.listdir(self.path[3:]):
                f += '\n' + item
            self.wfile.write(f.encode())
            return
        elif self.path[:3] == '/r/':
            pth = self.path[3:]
            try:
                os.remove(pth)
            except OSError:
                shutil.rmtree(pth)
            except IsADirectoryError:
                shutil.rmtree(pth)

            self.wfile.write("succes".encode())
            return
        self.path = makeValidPath(self.path)
        if self.path == './':
            f = open('./index.html').read()
            self.send_header('content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f.encode())
        else:
            try:
                f = open(self.path, 'rb')
                self.wfile.write(f.read())
            except:
                f = open('./thumb/generic.png', 'rb')
                self.wfile.write(f.read())
    def do_POST(self):
        content_length = int(self.headers['Content-Length']) # <--- Gets the size of data
        post_data = self.rfile.read(content_length) # <--- Gets the data itself
        self.path = makeValidPath(self.path)

        with open(self.path, 'wb') as fil:
            fil.write(post_data)

        isImage = True
        
        try:
            Image.open(self.path)
        except UnidentifiedImageError:
            isImage = False

        if isImage:
            subprocess.run("python resizer.py " + self.path)

        self.send_response(200)
        self.wfile.write("succes".encode())


def main():
    PORT = 80
    server = http.server.HTTPServer(('0.0.0.0', 80), handler)
    print("Running on port %s" % PORT)
    server.serve_forever()

if __name__ == '__main__':
    main()