//////////////////////////////////////////////////////////////////////////////
//
//  Angel.js
//
//////////////////////////////////////////////////////////////////////////////

//----------------------------------------------------------------------------
//
//  Helper functions
//

function _argumentsToArray( args )
{
    return [].concat.apply( [], Array.prototype.slice.apply(args) );
}

//----------------------------------------------------------------------------

function radians( degrees ) {
    const Pi = 3.1415926535897932384626433;
    return degrees * Pi / 180.0;
}

//----------------------------------------------------------------------------
//
//  Vector Constructors
//

function vec2()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    }

    return result.splice( 0, 2 );
}


function vec3()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    }

    return result.splice( 0, 3 );
}

function vec4()
{
    var result = _argumentsToArray( arguments );

    switch ( result.length ) {
    case 0: result.push( 0.0 );
    case 1: result.push( 0.0 );
    case 2: result.push( 0.0 );
    case 3: result.push( 1.0 );
        break;
    }

    return result.splice( 0, 4 );
}

//----------------------------------------------------------------------------
//
//  Matrix Constructors
//

function mat2()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec2( v[0],  0.0 ),
            vec2(  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec2(v) );  v.splice( 0, 2 );
        m.push( vec2(v) );
        break;
    }

    m.matrix = true;
    
    return m;
}

//----------------------------------------------------------------------------

function mat3()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec3( v[0],  0.0,  0.0 ),
            vec3(  0.0, v[0],  0.0 ),
            vec3(  0.0,  0.0, v[0] )
        ];
        break;

    default:
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );  v.splice( 0, 3 );
        m.push( vec3(v) );
        break;
    }cha

    m.matrix = true;
    
    return m;
}

//----------------------------------------------------------------------------

function mat4()
{
    var v = _argumentsToArray( arguments );

    var m = [];
    switch ( v.length ) {
    case 0:
        v[0] = 1;
    case 1:
        m = [
            vec4( v[0], 0.0,  0.0,   0.0 ),
            vec4( 0.0,  v[0], 0.0,   0.0 ),
            vec4( 0.0,  0.0,  v[0],  0.0 ),
            vec4( 0.0,  0.0,  0.0,  v[0] )
        ];
        break;

    default:
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );  v.splice( 0, 4 );
        m.push( vec4(v) );
        break;
    }

    m.matrix = true;
    
    return m;
}

//----------------------------------------------------------------------------
//
//  Generic Mathematical Operations for Vectors and Matrices
//

function equal( u, v )
{
    if ( u.length != v.length ) { return false; }

    if ( u.matrix && v.matrix ) {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i].length != v[i].length ) { return false; }
            for ( var j = 0; j < u[i].length; ++j ) {
                if ( u[i][j] !== v[i][j] ) { return false; }
            }
        }
    }
    else {
        for ( var i = 0; i < u.length; ++i ) {
            if ( u[i] !== v[i] ) { return false; }
        }
    }

    return true;
}

//----------------------------------------------------------------------------

function add( u, v )
{
    if ( u.length != v.length ) {
        throw "add: vectors " + u + " and " + v +
              " are not the same dimension";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( u[i] + v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

function subtract( u, v )
{
    if ( u.length != v.length ) {
        throw "subtract: vectors " + u + " and " + v +
              " are not the same dimension";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( u[i] - v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
//  Basic Matrix Transformations
//

function translate( x, y, z )
{
    if ( Array.isArray(x) ) {
        z = x[2];
        y = x[1];
        x = x[0];
    }

    var result = mat4();
    result[0][3] = x;
    result[1][3] = y;
    result[2][3] = z;

    return result;
}

//----------------------------------------------------------------------------

function rotate( angle, axis )
{
    if ( !Array.isArray(axis) ) {
        axis = [ arguments[1], arguments[2], arguments[3] ];
    }

    var v = normalize( axis );

    var x = v[0];
    var y = v[1];
    var z = v[2];
    
    var c = Math.cos( radians(angle) );
    var omc = 1.0 - c;
    var s = Math.sin( radians(angle) );

    var result = mat4(
        vec4( x*x*omc + c,   x*y*omc - z*s, x*z*omc + y*s, 0.0 ),
        vec4( x*y*omc + z*s, y*y*omc + c,   y*z*omc - x*s, 0.0 ),
        vec4( x*z*omc - y*s, y*z*omc + x*s, z*z*omc + c,   0.0 ),
        vec4()
    );

    return result;
}

//----------------------------------------------------------------------------
//
//  ModelView Matrix Generators
//

function lookAt( eye, at, up )
{
    if ( !Array.isArray(eye) || eye.length != 3) {
        throw "LookAt: first parameter [eye] must be an a vec3";
    }

    if ( !Array.isArray(at) || at.length != 3) {
        throw "LookAt: first parameter [at] must be an a vec3";
    }

    if ( !Array.isArray(up) || up.length != 3) {
        throw "lookAt: first parameter [up] must be an a vec3";
    }

    if ( equal(eye, at) ) {
        return mat4();
    }

    var v = normalize( subtract(at, eye) );  // view direction vector
    var n = normalize( cross(v, up) );       // perpendicular vector
    var u = normalize( cross(n, v) );        // "new" up vector

    v = negate( v );
    
    var result = mat4( 
        vec4( n, -dot(n, eye) ),
        vec4( u, -dot(u, eye) ),
        vec4( v, -dot(v, eye) ),
        vec4()
    );

    //console.log( result );
    return result;
}

//----------------------------------------------------------------------------
//
//  Projection Matrix Generators
//

function ortho( left, right, bottom, top, near, far )
{
    if ( left == right ) { throw "ortho: left and right are equal"; }
    if ( bottom == top ) { throw "ortho: bottom and top are equal"; }
    if ( near == far )   { throw "ortho: near and far are equal"; }

    var w = right - left;
    var h = top - bottom;
    var d = far - near;

    var result = mat4();
    result[0][0] = 2.0 / w;
    result[1][1] = 2.0 / h;
    result[2][2] = -2.0 / d;
    result[0][3] = (left + right) / w;
    result[1][3] = (top + bottom) / h;
    result[2][3] = (near + far) / d;

    return result;
}

//----------------------------------------------------------------------------

function perspective( fovy, aspect, near, far )
{
    var f = 1.0 / Math.tan( radians(fovy) / 2 );
    var d = far - near;

    var result = mat4();
    result[0][0] = f / aspect;
    result[1][1] = f;
    result[2][2] = (near + far) / d;
    result[2][3] = 2 * near * far / d;
    result[3][2] = -1;
    result[3][3] = 0.0;

    return result;
}

//----------------------------------------------------------------------------
//
//  Matrix Functions
//

function transpose( m )
{
    var result = [];
    for ( var i = 0; i < m.length; ++i ) {
        result.push( [] );
        for ( var j = 0; j < m[i].length; ++j ) {
            result[i].push( m[j][i] );
        }
    }

    result.matrix = m.matrix;
    
    return result;
}

//----------------------------------------------------------------------------

function mult( a, b )
{
    if ( a.matrix && b.matrix && a.length != b.length ) {
        throw "mult: arguments aren't of the same dimension";
    }
    
    var n = a.length;

    var result = [];
    for ( var i = 0; i < n; ++i ) {
        result.push( [] );
        for ( var j = 0; j < n; ++j ) {
            var sum = 0.0;
            for ( var k = 0; k < n; ++k ) {
                sum += a[i][k] * b[k][j];
            }
            result[i].push( sum );
        }
    }
    result.matrix = true;

    return result;
}

//----------------------------------------------------------------------------
//
//  Vector Functions
//

function dot( u, v )
{
    if ( u.length != v.length ) {
        throw "dot: vectors " + u + " and " + v + " are not the same dimension";
    }

    var sum = 0.0;
    for ( var i = 0; i < u.length; ++i ) {
        sum += u[i] * v[i];
    }

    return sum;
}

//----------------------------------------------------------------------------

function negate( u )
{
    result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( -u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

function cross( u, v )
{
    if ( !Array.isArray(u) ) {
        throw "cross: first argument " + u + " is not a vector";
    }

    if ( !Array.isArray(v) ) {
        throw "cross: second argument " + u + " is not a vector";
    }

    if ( u.length < 3 ) {
        throw "cross: first argument " + u +
            " must have at least three elements";
    }

    if ( v.length < 3 ) {
        throw "cross: second argument " + u +
            " must have at least three elements";
    }

    var result = [ 
        u[1]*v[2] - u[2]*v[1],
        u[2]*v[0] - u[0]*v[2],
        u[0]*v[1] - u[1]*v[0]
    ];
    //debugger;

    return result;
}

//----------------------------------------------------------------------------

function length( u )
{
    return Math.sqrt( dot(u, u) );
}

//----------------------------------------------------------------------------

function normalize( u )
{
    var len = length( u );

    if ( !isFinite(len) ) {
        throw "normalize: vector " + u + " has zero length";
    }

    var b = [];
    for ( var i = 0; i < u.length; ++i ) {
	b.push(u[i] / len);
    }

    return b;
}

//----------------------------------------------------------------------------

function lerp( s, u, v )
{
    if ( typeof s !== "number" ) {
        throw "lerp: the first paramter " + s + " must be a number";
    }
    
    if ( u.length != v.length ) {
        throw "vector dimension mismatch";
    }

    var result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] + (1.0 - s) * v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------
//
// Vector and Matrix functions
//

function scale( s, u )
{
    if ( !Array.isArray(u) ) {
        throw "scale: second parameter " + u + " is not a vector";
    }

    result = [];
    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] );
    }
    
    return result;
}

//----------------------------------------------------------------------------
//
//
//

function flatten( v )
{
    if ( v.matrix === true ) {
        v = transpose( v );
    }

    var n = v.length;
    var elemsAreArrays = false;

    if ( Array.isArray(v[0]) ) {
        elemsAreArrays = true;
        n *= v[0].length;
    }

    var floats = new Float32Array( n );

    if ( elemsAreArrays ) {
        var idx = 0;
        for ( var i = 0; i < v.length; ++i ) {
            for ( var j = 0; j < v[i].length; ++j ) {
                floats[idx++] = v[i][j];
            }
        }
    }
    else {
        for ( var i = 0; i < v.length; ++i ) {
            floats[i] = v[i];
        }
    }

    return floats;
}
