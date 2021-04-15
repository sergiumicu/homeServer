import sys
from PIL import Image

def main():
    path = sys.argv[1]
    W, H = (0, 0)

    with Image.open(path) as im:
        W, H = im.size
        
        if W > H:
            W = 170*W//H
            H = 170
        elif H < W:
            H = 170*H//W
            W = 170
        else:
            W = H = 170

        path = './thumb' + path[1:]
        
        im.resize((W, H)).save(path)

if __name__ == "__main__":
    main()