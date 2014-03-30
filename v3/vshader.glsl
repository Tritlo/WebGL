attribute  vec4 vPosition;
attribute  vec4 vColor;
attribute  vec4 vNormal;
attribute  vec2 vTexCoord;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 objectMatrix;
uniform vec4 lightPosition;

varying vec4 color;
varying vec3 fN,fL,fE;
varying vec2 texCoord;

void main() 
{
    //vec3 pos = -(modelViewMatrix * objectMatrix*vPosition).xyz;
    //vec3 pos = -( projectionMatrix*modelViewMatrix*objectMatrix*vPosition).xyz;
  
    vec3 pos = (modelViewMatrix *objectMatrix*vPosition).xyz;

    fN = normalize( modelViewMatrix*objectMatrix*vec4(vNormal)).xyz;
    fE =  normalize(-pos);
    fL = normalize( (modelViewMatrix*lightPosition).xyz - pos);


    texCoord = vTexCoord;
    color = vColor;
    gl_Position = projectionMatrix*modelViewMatrix*objectMatrix*vPosition;
} 
