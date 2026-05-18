export class Boid {
  x: number
  y: number
  vx: number
  vy: number

  // ol reliable
  // matchingFactor = 0.002
  // centeringFactor = 0.0002
  // avoidFactor = 0.002
  // turnFactor = 0.1
  // maxSpeed = 4.5
  // minSpeed = 3.0
  // visionRadius = 125
  // avoidRadius = 40

  matchingFactor = 0.016
  centeringFactor = 0.0005
  avoidFactor = 0.01
  turnFactor = 0.14
  maxSpeed = 8.0
  minSpeed = 2.5
  visionRadius = 120
  avoidRadius = 25

  constructor(x: number, y: number) {
    const angle = Math.random() * Math.PI * 2
    this.x = x
    this.y = y
    this.vx = Math.cos(angle) * this.minSpeed
    this.vy = Math.sin(angle) * this.minSpeed
  }

  update(dt: number) {
    this.x += this.vx * dt * 0.1
    this.y += this.vy * dt * 0.1
  }

  draw(ctx: CanvasRenderingContext2D) {
    const angle = Math.atan2(this.vy, this.vx)
    const size = 8
    ctx.save()
    ctx.translate(this.x, this.y)
    ctx.rotate(angle)
    ctx.beginPath()
    ctx.moveTo(size, 0)
    ctx.lineTo(-size, size / 2)
    ctx.lineTo(-size * 0.4, 0)
    ctx.lineTo(-size, -size / 2)
    ctx.closePath()
    ctx.fillStyle = 'white'
    ctx.fill()
    ctx.restore()
  }
}

export class Shockwave {
  x: number
  y: number
  opacity: number = 255
  diam: number = 0
  maxDiam: number = 300
  done: boolean = false

  constructor(x: number, y: number) {
    this.x = x
    this.y = y
  }

  update(ctx: CanvasRenderingContext2D, boids: Boid[]) {
    if (this.opacity <= 0) {
      this.done = true
      return
    }

    // draw ring
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.diam / 2, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(0,0,0,0)`
    ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity / 255 / 3})`
    ctx.fill()
    ctx.stroke()

    // push boids
    for (const boid of boids) {
      const dx = boid.x - this.x
      const dy = boid.y - this.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < this.diam / 2) {
        boid.vx += dx * 0.5
        boid.vy += dy * 0.5
      }
    }

    this.opacity -= 255 / (this.maxDiam / 10)
    this.diam += 10
  }
}

export class Flock {
  boids: Boid[]
  width: number
  height: number
  margin: number
  lines: boolean
  shockwaves: Shockwave[] = []

  constructor(count: number, width: number, height: number, margin: number = 150) {
    this.width = width
    this.height = height
    this.margin = margin
    this.lines = false
    this.boids = Array.from({ length: count }, () => new Boid(
      Math.random() * width,
      Math.random() * height
    ))
  }

  pathfind(ctx: CanvasRenderingContext2D) {
    const margin = this.margin

    for (const boid1 of this.boids) {
      const prevVx = boid1.vx
      const prevVy = boid1.vy
      let close_dx = 0, close_dy = 0
      let avg_vx = 0, avg_vy = 0
      let avg_px = 0, avg_py = 0
      let neighbors = 0

      for (const boid2 of this.boids) {
        if (boid1 === boid2) continue

        const dx = boid1.x - boid2.x
        const dy = boid1.y - boid2.y
        const distSq = dx * dx + dy * dy

        if (distSq > boid1.visionRadius * boid1.visionRadius) continue

        const angle = Math.atan2(boid1.vy, boid1.vx)
        const toBoid2 = Math.atan2(dy * -1, dx * -1) // flip because dx/dy is boid1-boid2
        const angleDiff = Math.abs(((toBoid2 - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI)
        // if (angleDiff > Math.PI * 0.75) continue

        if (this.lines) {
          ctx.beginPath()
          ctx.moveTo(boid1.x, boid1.y)
          ctx.lineTo(boid2.x, boid2.y)
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)'
          ctx.stroke()
        }

        // alignment
        avg_vx += boid2.vx
        avg_vy += boid2.vy

        // cohesion
        avg_px += boid2.x
        avg_py += boid2.y

        neighbors++

        // separation
        if (distSq < boid1.avoidRadius * boid1.avoidRadius) {
          close_dx += boid1.x - boid2.x
          close_dy += boid1.y - boid2.y
        }
      }

      if (neighbors > 0) {
        avg_vx /= neighbors
        avg_vy /= neighbors
        avg_px /= neighbors
        avg_py /= neighbors

        boid1.vx += (avg_vx - boid1.vx) * boid1.matchingFactor
        boid1.vy += (avg_vy - boid1.vy) * boid1.matchingFactor

        boid1.vx += (avg_px - boid1.x) * boid1.centeringFactor
        boid1.vy += (avg_py - boid1.y) * boid1.centeringFactor
      }

      boid1.vx += close_dx * boid1.avoidFactor
      boid1.vy += close_dy * boid1.avoidFactor

      // turn away from edges
      if (boid1.x > this.width - margin) boid1.vx -= boid1.turnFactor
      if (boid1.x < margin) boid1.vx += boid1.turnFactor
      if (boid1.y > this.height - margin) boid1.vy -= boid1.turnFactor
      if (boid1.y < margin) boid1.vy += boid1.turnFactor

      // clamp steering force  <-- ADD THIS before speed clamp
      const maxSteerForce = 0.5
      const dvx = boid1.vx - prevVx
      const dvy = boid1.vy - prevVy
      const dv = Math.sqrt(dvx * dvx + dvy * dvy)
      if (dv > maxSteerForce) {
        boid1.vx = prevVx + (dvx / dv) * maxSteerForce
        boid1.vy = prevVy + (dvy / dv) * maxSteerForce
      }

      // clamp speed
      const speed = Math.sqrt(boid1.vx * boid1.vx + boid1.vy * boid1.vy)
      if (speed > boid1.maxSpeed) {
        boid1.vx = (boid1.vx / speed) * boid1.maxSpeed
        boid1.vy = (boid1.vy / speed) * boid1.maxSpeed
      }
      if (speed < boid1.minSpeed) {
        boid1.vx = (boid1.vx / speed) * boid1.minSpeed
        boid1.vy = (boid1.vy / speed) * boid1.minSpeed
      }
    }
  }

  addShockwave(x: number, y: number) {
    this.shockwaves.push(new Shockwave(x, y))
  }

  update(dt: number, ctx: CanvasRenderingContext2D) {
    this.pathfind(ctx)
    for (const boid of this.boids) {
      boid.update(dt)
    }
    this.shockwaves = this.shockwaves.filter(s => !s.done)
    for (const shockwave of this.shockwaves) {
      shockwave.update(ctx, this.boids)
    }
  }

  toggleLines() {
    this.lines = !this.lines
  }

  updateParams(params: Partial<Pick<Boid, 'matchingFactor' | 'centeringFactor' | 'avoidFactor' | 'turnFactor' | 'maxSpeed' | 'minSpeed' | 'visionRadius' | 'avoidRadius'>>) {
    for (const boid of this.boids) {
      Object.assign(boid, params)
    }
  }

  getParams(): Pick<Boid, 'matchingFactor' | 'centeringFactor' | 'avoidFactor' | 'turnFactor' | 'maxSpeed' | 'minSpeed' | 'visionRadius' | 'avoidRadius'> {
    const b = this.boids[0]
    return {
      matchingFactor: b.matchingFactor,
      centeringFactor: b.centeringFactor,
      avoidFactor: b.avoidFactor,
      turnFactor: b.turnFactor,
      maxSpeed: b.maxSpeed,
      minSpeed: b.minSpeed,
      visionRadius: b.visionRadius,
      avoidRadius: b.avoidRadius,
    }
  }

  reset() {
    this.boids = Array.from({ length: this.boids.length }, () => new Boid(
      Math.random() * this.width,
      Math.random() * this.height
    ))
  }

  draw(ctx: CanvasRenderingContext2D) {
    for (const boid of this.boids) {
      boid.draw(ctx)
    }
  }
}
