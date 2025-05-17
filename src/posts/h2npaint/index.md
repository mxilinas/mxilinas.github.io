---
title: H2NPaint
excerpt: "A Unity editor tool for generating 3D terrain from images"
image: "/posts/h2npaint/mountains.png"
tags: ["c#", "unity"]
---

# H2NPaint
**A Unity editor tool for generating 3D terrain from images**

![](/posts/h2npaint/mountains.png)

Creating terrain for 3D games the traditional way requires proficiency with 3D 
modelling software.
Alternative methods leveraging generative noise are fast and easy but yeild 
generic results.
H2NPaint is intended to be a middle ground. It allows game developers to 
generate 3D landscapes from simple sketches or images, providing the same 
convenience of procedural methods while allowing users to *design* the terrain 
with their own inputs.

## Overview

![](/posts/h2npaint/ui_full.png)

H2NPaint runs in the Unity editor. It exposes UI for uploading images, 
generating height and normal maps using different algorithms, making adjustments 
with post-processing effects, and downloading the results for use in other 
applications. H2NPaint also connects directly to meshes in Unity to be used 
locally.

## Implementation

H2N stands for "Height to Normal"

First, H2NPaint calculates a distance matrix, or height map, from the input 
image.
The height map is then used to generate a normal map which serves an an input 
texture to a subdivided plane mesh.
Simultaneously, the height map is used to displace the vertices of the mesh 
using a custom shader.
The result is a 3D landscape generated from a 2D image.

![](/posts/h2npaint/H2NPaint_flow.svg)

### Calculating the Distance Matrix

The distance matrix stores the distances between each non-black pixel and its 
nearest black or edge pixel. There are several methods of calculating the 
distance matrix and each has its own visual style.

#### 1. City Block (Manhattan)

The city block or Manhattan scheme considers distances in four directions: up, 
right, left, and down, ignoring diagonals. Visually, this results in harder and 
more boxy maps.

```c#
int width = inputTexture.width;
int height = inputTexture.height;
int maxDist = width + height;
float[,] distMat = InitDistanceMat(inputTexture, maxDist);

// Scan from top left to bottom right (forward pass)
for (int y = height - 2; y >= 0; y--)
{
    for (int x = 1; x < width; x++)
    {
        if (distMat[x, y] > distMat[x - 1, y] + 1) {
            distMat[x, y] = distMat[x - 1, y] + 1;
        }
        if (distMat[x, y] > distMat[x, y + 1] + 1) {
            distMat[x, y] = distMat[x, y + 1] + 1;
        }
    }
}

```

![](/posts/h2npaint/forward_pass.png)

```c#
// Scan from bottom right to top left (backward pass)
for (int y = 1; y <= height - 1; y++)
{
    for (int x = width - 2; x >= 0; x--)
    {
        if (distMat[x, y] > distMat[x + 1, y] + 1) {
            distMat[x, y] = distMat[x + 1, y] + 1;
        }
        if (distMat[x, y] > distMat[x, y - 1] + 1) {
            distMat[x, y] = distMat[x, y - 1] + 1;
        }
    }
}
```

![](/posts/h2npaint/backward_pass.png)

#### Exact Euclidian Method

Unlike the Manhattan, the exact Euclidian scheme considers diagonal 
distances. It stores the distance between each object (non-black) pixel and its 
nearest contour (edge) pixel. This is can be considerably slower than the 
Manhattan method especially using the naive approach included here. A more 
efficient version is used in the project and can be found on GitHub.

```c#
int width = inputTexture.width;
int height = inputTexture.height;
float maxDist = Mathf.Pow(width - 1, 2) + Mathf.Pow(height - 1, 2);

// Create the distance matrix
float[,] distMat = InitDistanceMat(inputTexture, maxDist);

// Find the contour pixels
List<Vector2Int> contourPixels = FindContourPixels(distMat);

// Store the distance between each pixel and its nearest contour pixel.
for (int x = 0; x < width; x++)
{
    for (int y = 0; y < height; y++)
    {
        if (distMat[x, y] > 0)) {
            distMat[x, y] = FindMinimumDistance(x, y, contourPixels, maxDist);
        }
    }
}

```

#### Comparison
![](/posts/h2npaint/mapgen_exact.png)
![](/posts/h2npaint/mapgen_city.png)

## Future Work
- Use a compute shaders to calculate the height and normal maps.
- Allow the user to draw input images in the editor.
- Implement other methods of calculating the distance matrix.
- Use the wave function collapse algorithm to generate procedural maps for 
infinite terrain. 
