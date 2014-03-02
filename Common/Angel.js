
//----------------------------------------------------------------------------
//
//  "Constructors"
//
function vec2( x, y )
{
    return [ x, y ];
}

function vec3( x, y, z )
{
    return [ x, y, z ];
}

function vec4( x, y, z, w )
{
    return [ x, y, z, w || 1.0 ];
}

//----------------------------------------------------------------------------
//
//  Mathematical Operations
//

/**
 */
function add( u, v )
{
    if ( u.length != v.length ) {
        throw "add: vectors " + u + " and " + v + " are not the same size";
    }

    var result = [];

    for ( var i = 0; i < u.length; ++i ) {
        result.push( u[i] + v[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

/**
 */
function scale( s, u )
{
    if ( typeof s !== "number" ) {
        throw "scale: the first paramter " + s + " must be a number";
    }
    
    var result = [];

    for ( var i = 0; i < u.length; ++i ) {
        result.push( s * u[i] );
    }

    return result;
}

//----------------------------------------------------------------------------

function length( u )
{
    var mag = 0.0;

    for ( var i = 0; i < u.length; ++i ) {
        mag += u[i] * u[i];
    }

    return Math.sqrt( mag );
}

//----------------------------------------------------------------------------

function normalize( u )
{
    var len = length( u );

    if ( !isFinite(len) ) {
        throw "normalize: vector " + u + " has zero length";
    }
    
    for ( var i = 0; i < u.length; ++i ) {
        u[i] /= len;
    }

    return u;
}

//----------------------------------------------------------------------------

function lerp( s, u, v )
{
    if ( typeof s !== "number" ) {
        throw "scale: the first paramter " + s + " must be a number";
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
//
//
/**
 */
function flatten( v )
{
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
