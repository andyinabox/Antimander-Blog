""" Rasterize a state and saves the tile information as a binary file.
    This is necessary for fast drawing.
"""
import os
import sys
import cv2
import numpy as np
import json

def state2img(state, r, margin):
    img = np.zeros((r//2, r, 3), dtype='uint8')
    r -= 2 * margin
    x0, y0, x1, y1 = state['bbox']
    scale = min(r/(x1-x0), r/(y1-y0))
    bottom = np.array([x0, y0])
    for idx, multipoly in enumerate(state['shapes']):
        for shape in multipoly:
            array = np.array(shape)
            array = (array - bottom) * scale
            array = array.astype('i')
            array = array.reshape((-1,1,2))
            j = idx + 1
            cv2.fillPoly(img, [array+margin], ((j >> 16)&255, (j >> 8)&255, j&255))
    return cv2.flip(img, 0)

if __name__ == '__main__':
    out = os.path.splitext(sys.argv[1])[0]
    margin = 8
    with open(sys.argv[1], 'r') as f:
        state = json.load(f)
        img = state2img(state, r=1024, margin=margin)
        np.save(out, img)
        cv2.imwrite(out +'.png', img[:,:,::-1]) # For debugging.