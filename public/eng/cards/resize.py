import os
from PIL import Image
import math

filenames = [f for f in os.listdir('.') if f.endswith('.png')]
size = (1024, 1024)

for filename in filenames:
    image = Image.open(filename)
    image.thumbnail(size)
    image.save(filename.split(".png")[0] + ".small.png", "PNG")
