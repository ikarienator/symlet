function polynomialQ (ast, va) {

}

function toRational (real, eps) {
    eps = eps || 1e-10;
    var int = Math.floor(real), frac = real - int;
    if (frac < eps) {
        return [int, 1];
    } else if (1 - frac < eps) {
        return [int + 1, 1];
    }
    var lo = 0.5 / (frac + eps),
        hi = 0.5 / (frac - eps);
    frac = toRational(hi + lo, hi - lo);
    return [int * frac[0] + frac[1], frac[0]];
}