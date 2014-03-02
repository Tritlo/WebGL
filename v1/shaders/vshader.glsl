attribute vec4 vPosition;
attribute vec4 vertColor;
varying lowp vec4 vColor;

void main()
{
    gl_Position = vPosition;
    gl_PointSize = 4.0;
    vColor = vertColor;
}