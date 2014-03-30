#ifdef GL_ES
precision highp float;
#endif

uniform vec4 ambientProduct, diffuseProduct, specularProduct;
uniform float shininess;

varying vec4 color;
varying vec3 fN,fL,fE;
varying  vec2 texCoord;
uniform sampler2D texture;

void main()
{
    vec3 N = normalize(fN);
    vec3 E = normalize(fE);
    vec3 L = normalize(fL);
  
  
    vec3 H = normalize( L + E );
    
    vec4 fColor;
    vec4 ambient = ambientProduct;

    float Kd = max( dot(L, N), 0.0 );
    vec4  diffuse = Kd*diffuseProduct;

    float Ks = pow( max(dot(N, H), 0.0), shininess );
    vec4  specular = Ks * specularProduct;

    if( dot(L, N) < 0.0 ) specular = vec4(0.0, 0.0, 0.0, 1.0);
		    
    fColor = ambient + diffuse +specular;
    fColor.a = 1.0;
		    
    gl_FragColor = fColor*color*texture2D( texture, texCoord );
}
