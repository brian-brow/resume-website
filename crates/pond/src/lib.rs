//! Rust port of `src/pond/engine.ts`.
//!
//! Status: starter. The water surface and Bayer dither are ported; ripples,
//! the swaying shapes and the boids are still TODO. It mirrors the TS
//! `PondCore` interface so it can be swapped in behind the same React code.
//!
//! Pixels live in Rust memory. JS calls `render`, then reads `pixels_ptr()`
//! straight out of `memory.buffer` with no copy.

use wasm_bindgen::prelude::*;

// Little-endian ABGR, same as the TS version
const INK: u32 = 0xff1c_1c1c;
const PAPER: u32 = 0xffff_ffff;

const LX: f32 = 0.6;
const LY: f32 = -0.8;

const BAYER: [u8; 64] = [
    0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60,
    28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15,
    47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21,
];

/// Directional waves: [kx, ky, amplitude, speed, phase]
const WAVES: [[f32; 5]; 3] = [
    [0.06, 0.02, 1.3, 0.9, 0.0],
    [-0.03, 0.075, 0.8, 1.2, 1.7],
    [0.11, -0.05, 0.3, 1.4, 3.1],
];

#[wasm_bindgen]
pub struct Pond {
    width: f32,
    height: f32,
    t: f32,
    phases: [f32; 3],
    pixels: Vec<u32>,
}

#[wasm_bindgen]
impl Pond {
    #[wasm_bindgen(constructor)]
    pub fn new(width: u32, height: u32) -> Pond {
        Pond {
            width: width.max(1) as f32,
            height: height.max(1) as f32,
            t: 0.0,
            phases: [0.0; 3],
            pixels: Vec::new(),
        }
    }

    pub fn resize(&mut self, width: u32, height: u32) {
        self.width = width.max(1) as f32;
        self.height = height.max(1) as f32;
    }

    pub fn step(&mut self, t: f32, _dt: f32) {
        self.t = t;
        for (phase, wave) in self.phases.iter_mut().zip(WAVES.iter()) {
            *phase = wave[4] - wave[3] * t;
        }
    }

    /// TODO: ripples + scaring the boids
    pub fn poke(&mut self, _x: f32, _y: f32, _t: f32) {}

    /// Paint a crop of the field into the internal pixel buffer (sw * sh).
    pub fn render(&mut self, sx: i32, sy: i32, sw: u32, sh: u32) {
        let len = (sw * sh) as usize;
        self.pixels.resize(len, PAPER);

        let light_x = self.width * 0.625;
        let light_y = self.height * 0.38;
        let light_r = self.width * 0.79;

        for j in 0..sh as i32 {
            let y = sy + j;
            let yf = y as f32;
            let warp = 4.0 * (yf * 0.031 + self.t * 0.4).sin();
            for i in 0..sw as i32 {
                let x = sx + i;
                let xf = x as f32;
                let wx = xf + warp;

                let mut gx = 0.0_f32;
                let mut gy = 0.0_f32;
                for (wave, phase) in WAVES.iter().zip(self.phases.iter()) {
                    let c = wave[2] * (wave[0] * wx + wave[1] * yf + phase).cos();
                    gx += c * wave[0];
                    gy += c * wave[1];
                }

                let bx = xf - light_x;
                let by = yf - light_y;
                let base = 1.0 - ((bx * bx + by * by).sqrt() / light_r).min(1.0);
                let tone = 0.06 + 0.42 * base + 1.5 * (gx * LX + gy * LY);

                let threshold = (BAYER[((y & 7) * 8 + (x & 7)) as usize] as f32 + 0.5) / 64.0;
                let idx = (j as u32 * sw + i as u32) as usize;
                self.pixels[idx] = if tone > threshold { INK } else { PAPER };
            }
        }
    }

    /// Pointer to the last rendered crop, for a zero-copy Uint32Array view in JS.
    pub fn pixels_ptr(&self) -> *const u32 {
        self.pixels.as_ptr()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn render_is_one_bit() {
        let mut pond = Pond::new(480, 300);
        pond.step(1.0, 1.0 / 30.0);
        pond.render(100, 50, 64, 48);
        assert_eq!(pond.pixels.len(), 64 * 48);
        assert!(pond.pixels.iter().all(|&c| c == INK || c == PAPER));
    }
}
