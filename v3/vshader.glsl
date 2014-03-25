attribute  vec4 vPosition;
attribute  vec4 vColor;
attribute  vec4 vNormal;
attribute  vec2 vTexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 objectMatrix;
uniform vec4 lightPosition;

varying vec4 color;
varying vec3 N,L,E;
varying vec2 texCoord;

void main() 
{
    //vec3 pos = -(modelViewMatrix * objectMatrix*vPosition).xyz;
    vec3 pos = -( projectionMatrix*modelViewMatrix*objectMatrix*vPosition).xyz;
    vec3 light = lightPosition.xyz;
    L = normalize( light - pos );
    E =  -pos;
    color = vColor;
    //N = normalize( (modelViewMatrix*objectMatrix*vNormal).xyz);
    N = normalize( (vNormal).xyz);
    //texCoord = vTexCoord;
    gl_Position = projectionMatrix*modelViewMatrix*objectMatrix*vPosition;
} 