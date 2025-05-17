precision highp float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform bool u_mobile;
uniform vec3 u_base_color;

// Generate a random number.
float N21(vec2 p) {
    p = fract(p * vec2(233.24, 851.73));
    p += dot(p, p + 23.45);
    return fract(p.x * p.y);
}

// Generate a random position.
vec2 N22(vec2 p) {
    float n = N21(p);
    return vec2(n, N21(p + n));
}

float df_line(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * t);
}

float draw_line(vec2 p, vec2 a, vec2 b) {
    float df = df_line(p, a, b);
    df = step(df, 0.005);
    return df;
}

vec2 getPos(vec2 id, vec2 offset) {
    vec2 n = N22(id + offset) * u_time;
    return offset + sin(n * 0.1) * 0.4;
}

void main() {
    vec2 gv = (gl_FragCoord.xy - 0.5 / u_resolution.xy) / u_resolution.y;

    vec2 st = gv * 10.0;

    vec2 id = floor(st);

    st = fract(st) - 0.5;

    vec3 color = vec3(0.0);

    // Get points.
    vec2 points[9];
    int i = 0;
    for (float y = -1.0; y <= 1.0; y++) {
        for (float x = -1.0; x <= 1.0; x++) {
            points[i++] = getPos(id, vec2(y, x));
        }
    }

    // Draw lines.
    for (int i = 0; i < 9; i++) {
        float dist = distance(points[4], points[i]);
        float line = draw_line(st, points[4], points[i]);
        color += max(line * (1.0 - dist), 0.0);
    }
    color += max(draw_line(st, points[1], points[3]) * (1.0 - distance(points[1], points[3])), 0.0);
    color += max(draw_line(st, points[1], points[5]) * (1.0 - distance(points[1], points[5])), 0.0);
    color += max(draw_line(st, points[7], points[3]) * (1.0 - distance(points[7], points[3])), 0.0);
    color += max(draw_line(st, points[7], points[5]) * (1.0 - distance(points[7], points[5])), 0.0);

    // Draw points.
    vec2 point = getPos(id, vec2(0.0));
    float dot = distance(st, point);
    dot = smoothstep(0.05, 0.02, dot);
    color += dot * (sin((u_time + point.x * 100.0) * 0.1) / 1.5 + 1.5);

    // Interactive mouse.
    vec2 lz = gl_FragCoord.xy / u_resolution.xy;
    lz -= 0.5;
    lz.x *= u_resolution.x / u_resolution.y;
    vec2 m = (u_mouse - 0.5);
    m.x *= u_resolution.x / u_resolution.y;
    color /= smoothstep(0.0, 0.5, distance(lz, m));
    color = clamp(color, 0.0, 0.5);

    // Constrain to corner.
    vec3 mask = vec3(0.0);

    float distTopRight;
    if (u_mobile) {
        distTopRight = distance(gv, vec2(1.0, 1.0));
    } else {
        distTopRight = distance(gv, vec2(2.0, 1.0));
    }
    distTopRight = smoothstep(0.4, 1.0, distTopRight);
    mask = vec3(1.0 - distTopRight);

    if (!u_mobile) {
        float distBottomLeft = distance(gv, vec2(0.0, 0.0));
        distBottomLeft = smoothstep(0.4, 1.0, distBottomLeft);
        mask += vec3(1.0 - distBottomLeft);
    }

    color *= mask;
    color = smoothstep(0.0, 0.8, 1.0 - color);
    color *= u_base_color;

    gl_FragColor = vec4(color, 1.0);
}
