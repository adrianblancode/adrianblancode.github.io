// Ported from the Claude Design project "Blueprint smartphone assembly hero".
// The class is the design's own logic. Changes from the export:
// - three.js and Vanta come from the bundle instead of a CDN
// - programmatic scrolls are instant, since the site sets scroll-behavior: smooth
// - the night toggle is wired up here instead of through a template binding
// - outlines.json isn't part of the export, so the parts use rounded-box walls
// - the phone tracks the scroll closely instead of coasting behind it at a capped speed
import * as THREE from 'three'
import FOG from 'vanta/src/vanta.fog.js'

export const defaultProps = { lightBg: 97, darkBg: 9, showGuides: true, scrollLength: 600 }

// Minimal stand-in for the Claude Design runtime: props, setState, and refs bound from data-ref
class DCLogic {
  constructor(props) {
    this.props = props
    this.state = {}
  }

  setState(update) {
    this.state = { ...this.state, ...update(this.state) }
    this.componentDidUpdate()
  }

  mount(root) {
    root.querySelectorAll('[data-ref]').forEach(el => {
      const ref = this[el.dataset.ref]
      if (ref) ref.current = el
    })
    this.componentDidMount()
  }

  unmount() {
    this.componentWillUnmount()
  }
}

export class BlueprintScene extends DCLogic {
  constructor(props = defaultProps) {
    super(props);
    ['cRef','stick','scene','mat','matDots','axX','axY','matBot','matLeft','stage','walls','btnVol','btnPwr','btnVolS','btnVolF','btnVolN','btnVolR','btnVolT','btnVolB','btnPwrS','btnPwrF','btnPwrN','btnPwrR','btnPwrT','btnPwrB','faceBack','backPanel','faceFront','frontShell','nubVol','nubPwr','flipRef','pRim','camB1','camB2','camB3','lens1','lens2','lens3','camWrap','camBase','sfx','ring1','ring2','ring3','gGuides','gl1','gl2','pFrame','mCell','mCoil','mStrip','mBoard','mFlash','mTop','mTopD','mEar','mBotRt','mBotLeft','mCtrl','mUsb','mVol','mPwr','fpCav','fpBezel','fpSlit','fpHole','gBoot','gBootTxt','gGlare','gVanta','gScreen','gFill','gCta','gL1','gL2','gL3','gBtn','gHead','headMain','gHint','nightBtn','nightKnob'].forEach(k => { this[k] = { current: null }; });
    this.state = { night: false };
    this.toggleNight = () => this.setState(s => ({ night: !s.night }));
// every part is keyed to the phone's ANGLE: in flight before 90 deg, all seated by ~120
    this.parts = ['mBotRt','mUsb','mCtrl','mBotLeft','mCell','mCoil','mStrip','mBoard','mFlash','mEar','mTop','mTopD','camWrap','camB3','camB2','camB1']
      .map((r, i) => ({ r, dx: -(900 + i * 130), a0: 60 + i * 2.0, a1: 108 + i * 4.4 }));
    // how deep each part sits inside the shell (fraction of the full 2T thickness, measured in from the back cover)
    this.baseOff = { mFlash: 0.7, mCoil: 1.9 };   // flash on the logic board, coil on the battery
    this.wallOnly = { camWrap: 1.05 };  // wall thickness for parts whose art is placed by zIn
    this.depth = { mCell: 1.9, mCoil: 0.35, mBoard: 0.7, mFlash: 0.42, mStrip: 0.385, mTop: 0.6, mTopD: 0.6, mEar: 0.56, mBotLeft: 0.63, mUsb: 0.56, mCtrl: 0.49, mBotRt: 0.63 };   // mm
    this.zIn = { camWrap: 0.44, camB1: 0.40, camB2: 0.40, camB3: 0.40 };   // cluster on the plate, barrels proud of the back face
    this.cur = 0; this.target = 0; this.vel = 0; this.raf = 0;
    this.tilt = 0; this.over = 0; this.overT = 0; this.overV = 0; this.dragging = false; this.axis = null;
    this.buildWarp();
    Object.defineProperty(this, 'MAX', { get: () => this.dragging ? 0.0090 : 0.0032 });
    Object.defineProperty(this, 'MAXO', { get: () => this.MAX * (360 / 0.84) });
    this.onScroll = () => { this.measure(); this.loop(); };
    this.onDown = e => {
      if (e.button) return;
      if (e.target && e.target.closest && e.target.closest('button,a')) return;
      cancelAnimationFrame(this.flingRaf || 0); this.flingRaf = 0; this.dragDx = 0;
      const sc = this.cRef.current;
      if (sc && this.denom) window.scrollTo({ top: sc.offsetTop + this.cur * this.denom, behavior: 'instant' });
      this.vel = 0; this.overV = 0; this.overT = this.over;
      this.dragging = true; this.px = e.clientX; this.py = e.clientY; this.tx = 0; this.ty = 0; this.axis = null;
      this.overT = this.over; this.overV = 0; this.vel = 0;   // kill any coast so the new drag is in charge
      try { this.stick.current.setPointerCapture(e.pointerId); } catch (err) {}
      this.stick.current.style.cursor = 'grabbing'; this.loop();
    };
    this.onMove = e => {
      if (!this.dragging) return;
      const dx = e.clientX - this.px, dy = e.clientY - this.py;
      this.px = e.clientX; this.py = e.clientY;
      // both axes at once: horizontal turns the phone, vertical tilts it
      if (dx) {
        // once the timeline is spent, the drag keeps turning the finished phone instead of stalling
        const atEnd = this.target > 0.999 && this.cur > 0.995;
        const dpp = 1.2 * (360 / 0.84) / (this.denom || 2000);   // same px-to-degrees as the scroll
        if (this.overT > 0 || (atEnd && dx > 0)) this.overT = Math.max(0, this.overT + dx * dpp);
        else { window.scrollBy({ top: dx * 1.2, behavior: 'instant' }); this.dragDx = (this.dragDx || 0) * 0.7 + dx * 0.3; }
      }
      if (dy) this.tilt = Math.max(-18, Math.min(18, this.tilt - dy * 0.11));
      this.loop();
    };
    this.onUp = () => {
      this.dragging = false; this.axis = null;
      if (this.over > 0 && Math.abs(this.overV) > 0.02) this.overT = Math.max(0, this.overT + this.overV * 34);
      // coast the PAGE, not the derived target: measure() re-reads scrollTop every frame
      if (Math.abs(this.dragDx || 0) > 0.4 && this.denom) {
        let px = this.dragDx * 1.2;
        cancelAnimationFrame(this.flingRaf || 0);
        const glide = () => {
          if (this.dragging || Math.abs(px) < 0.35) { this.flingRaf = 0; return; }
          window.scrollBy({ top: px, behavior: 'instant' });
          px *= 0.93;
          this.flingRaf = requestAnimationFrame(glide);
        };
        this.flingRaf = requestAnimationFrame(glide);
      } if (this.stick.current) this.stick.current.style.cursor = 'grab'; this.loop(); };
    this.onWheel = e => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY) * 1.2) { e.preventDefault(); window.scrollBy({ top: e.deltaX * 1.4, behavior: 'instant' }); } };
  }
  ramp(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
  initVanta() {
    if (this._vantaUp || !this.gVanta.current) return;
    this._vantaUp = true;
    // Vanta passes hex colors straight to its shader, so stop three.js from
    // converting them to linear color space (the default since three r152)
    THREE.ColorManagement.enabled = false;
    try {
      this.vanta = FOG({
        el: this.gVanta.current, THREE,
        mouseControls: false, touchControls: false, gyroControls: false,
        minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
        highlightColor: 0x5FE3CE, midtoneColor: 0x2A4FB8, lowlightColor: 0x121A4A,
        baseColor: 0x04060E, blurFactor: 0.72, zoom: 0.5, speed: 0.24
      });
    } catch (err) { /* no WebGL: the screen keeps its flat blue fill */ }
  }

  buildWarp() {
    // scroll-to-angle rate dips through the button press instead of halting: a U-shaped curve
    const N = 256, c = 0.38, s = 0.085, depth = 0.66, acc = [0];
    for (let i = 1; i <= N; i++) {
      const u = (i - 0.5) / N;
      acc.push(acc[i - 1] + (1 - depth * Math.exp(-((u - c) * (u - c)) / (2 * s * s))));
    }
    this.warp = acc.map(v => v / acc[N]);
  }
  warpU(u) {
    const N = this.warp.length - 1, x = Math.max(0, Math.min(1, u)) * N, i = Math.min(N - 1, Math.floor(x));
    return this.warp[i] + (this.warp[i + 1] - this.warp[i]) * (x - i);
  }
  hex(a, b, t) {
    const pr = x => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
    const A = pr(a), B = pr(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  mix(a, b, t, alpha) {
    const pr = x => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)];
    const A = pr(a), B = pr(b);
    return 'rgba(' + A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',') + ',' + (alpha == null ? 1 : alpha) + ')';
  }
  easeOut(t) { return 1 - Math.pow(1 - t, 3); }
  measure() {
    const c = this.cRef.current; if (!c) return;
    const denom = Math.max(1, c.offsetHeight - window.innerHeight);
    this.denom = denom;
    this.target = Math.min(1, Math.max(0, -c.getBoundingClientRect().top / denom));
  }
  loop() {
    if (this.raf) return;
    const step = () => {
      this.raf = 0;
      const d = this.target - this.cur;
      const MAX = this.MAX;                     // hard ceiling on scroll rate
      const K = 0.0028, C = 2 * Math.sqrt(0.0028); // critically damped: long lazy coast, zero overshoot
      if (this.dragging) {
        // 1:1 with the finger, and remember the rate so the release still coasts
        this.vel = Math.max(-MAX, Math.min(MAX, this.vel * 0.6 + d * 0.4));
        this.cur = this.target;
        this.overV = Math.max(-this.MAXO, Math.min(this.MAXO, this.overV * 0.6 + (this.overT - this.over) * 0.4));
        this.over = this.overT;
        this.boost = 1;
        this.draw(this.cur);
        this.raf = requestAnimationFrame(step);
        return;
      }
      // follow the scroll closely: ease most of the gap away within ~0.2s, whatever the frame rate
      const now = performance.now(), dt = Math.min(64, now - (this.lastT || now - 16.7));
      this.lastT = now;
      this.boost = (this.boost || 0) * 0.90;
      const settled = Math.abs(d) < 0.0005;
      if (settled) { this.cur = this.target; this.vel = 0; } else { this.vel = d * (1 - Math.exp(-dt / 70)); this.cur += this.vel; }
      if (!this.dragging && this.target < 0.999 && this.overT > 0) this.overT *= 0.86;   // scrolling back unwinds it
      const dO = this.overT - this.over, MAXO = this.MAXO;
      if (dO * this.overV < 0 && Math.abs(dO) > MAXO) {
        this.overV = Math.sign(dO) * Math.min(MAXO, Math.abs(dO), Math.max(MAXO * 0.55, Math.abs(dO) * 0.5));
        this.boost = 1;
      }
      this.overV += K * (2.6 + 9 * this.boost) * dO - C * this.overV;
      this.overV = Math.max(-MAXO, Math.min(MAXO, this.overV));
      if (Math.abs(this.overV) < 0.05 && Math.abs(dO) < 0.35) { this.over = this.overT; this.overV = 0; } else this.over += this.overV;
      if (this.over < 0.15 && this.overT < 0.15) { this.over = 0; this.overT = 0; }
      if (this.over > 360 && this.overT > 360) { this.over -= 360; this.overT -= 360; }
      if (!this.dragging) this.tilt += -this.tilt * 0.045;   // hand-tilt settles back to level
      if (!this.dragging && Math.abs(this.tilt) < 0.05) this.tilt = 0;
      if (!settled || this.tilt !== 0 || this.over !== this.overT || this.dragging) this.raf = requestAnimationFrame(step);
      this.draw(this.cur);
    };
    this.lastT = 0;
    this.raf = requestAnimationFrame(step);
  }
  buildPartWalls() {
    const list = ['mBotRt','mUsb','mCtrl','mBotLeft','mCell','mCoil','mStrip','mBoard','mFlash','mEar','mTop','mTopD','camWrap'];   // the barrels carry their own cylinder walls
    const OL = this.outlines || null;
    const T = this.frontShell.current ? this.frontShell.current.clientWidth * 0.05106 : 0;
    if (!T) return;
    list.forEach(ref => {
      const el = this[ref] && this[ref].current; if (!el) return;
      const w = el.clientWidth, hh = el.clientHeight; if (!w || !hh) return;
      const d = (this.depth[ref] || this.wallOnly[ref] || 1) * (2 * T / 7.2);
      const R = Math.min(Math.min(w, hh) * 0.30, 1.1 * (2 * T / 7.2) * 2.2);
      const poly = OL && OL[ref];
      let segs;
      if (poly) {
        // wall ring follows the part's traced silhouette, one quad per edge
        segs = [];
        let area = 0;
        for (let i = 0; i < poly.length; i++) {
          const p0 = poly[i], p1 = poly[(i + 1) % poly.length];
          area += (p1[0] * w - p0[0] * w) * (p1[1] * hh + p0[1] * hh);
        }
        const cw2 = area > 0;
        for (let i = 0; i < poly.length; i++) {
          const p0 = poly[i], p1 = poly[(i + 1) % poly.length];
          const ax = p0[0] * w, ay = p0[1] * hh, bx2 = p1[0] * w, by2 = p1[1] * hh;
          const dx = bx2 - ax, dy = by2 - ay, len = Math.hypot(dx, dy);
          if (len < 0.5) continue;
          const ang = Math.atan2(dy, dx) * 180 / Math.PI;
          segs.push({ x: (ax + bx2) / 2, y: (ay + by2) / 2, len: len * 1.14, a: ang, n: ang + (cw2 ? -90 : 90) });
        }
      } else segs = [
        { x: 0, y: hh / 2, len: hh - 2 * R, a: 90, n: 180 },
        { x: w, y: hh / 2, len: hh - 2 * R, a: 90, n: 0 },
        { x: w / 2, y: 0, len: w - 2 * R, a: 0, n: 270 },
        { x: w / 2, y: hh, len: w - 2 * R, a: 0, n: 90 }
      ];
      if (!poly) {
        const CN = 4, stepA = 90 / CN, arcLen = (Math.PI / 180) * stepA * R * 1.25;
        [[R, R, 180], [w - R, R, 270], [w - R, hh - R, 0], [R, hh - R, 90]].forEach(([cx, cy, a0]) => {
          for (let i = 0; i < CN; i++) {
            const th = (a0 + (i + 0.5) * stepA) * Math.PI / 180;
            segs.push({ x: cx + R * Math.cos(th), y: cy + R * Math.sin(th), len: arcLen, a: (a0 + (i + 0.5) * stepA) + 90, n: a0 + (i + 0.5) * stepA });
          }
        });
      }
      let pool = el.querySelectorAll(':scope > [data-pwall]');
      if (pool.length !== segs.length) {
        Array.prototype.forEach.call(pool, n2 => n2.remove());
        for (let i = 0; i < segs.length; i++) {
          const q = document.createElement('div');
          q.dataset.pwall = '1';
          q.style.cssText = 'position:absolute;left:0;top:0;transform-origin:50% 50%;opacity:0;pointer-events:none;';
          el.appendChild(q);
        }
        pool = el.querySelectorAll(':scope > [data-pwall]');
      }
      for (let i = 0; i < segs.length; i++) {
        const s = segs[i], q = pool[i];
        q.dataset.n = s.n;
        q.style.width = s.len + 'px';
        q.style.height = d.toFixed(2) + 'px';
        q.style.transform = 'translate(' + (s.x - s.len / 2).toFixed(2) + 'px,' + (s.y - d / 2).toFixed(2) + 'px) translateZ(' + (-d / 2).toFixed(2) + 'px) rotateZ(' + s.a + 'deg) rotateX(90deg)';
      }
    });
  }
  buildWalls() {
    const wr = this.walls.current; if (!wr || !wr.clientWidth) return;
    const bw = wr.clientWidth, bh = wr.clientHeight;
    const HT = 2 * this.frontShell.current.clientWidth * 0.05106;
    const tn = this._tN == null ? 1 : this._tN, tfr = this._tF == null ? 1 : this._tF;
    const thAt = x => HT * (tn + (tfr - tn) * Math.min(1, Math.max(0, x / bw)));
    const R = bw * 0.1146;
    const segs = [
      { x: 0, y: bh / 2, len: bh - 2 * R, a: 90, n: 180 },
      { x: bw, y: bh / 2, len: bh - 2 * R, a: 90, n: 0 }
    ];
    const SPAN = bw - 2 * R, NS = 12, sl = SPAN / NS;   // top and bottom run in slices so thickness eases across
    for (let i = 0; i < NS; i++) {
      const cx = R + (i + 0.5) * sl;
      segs.push({ x: cx, y: 0, len: sl * 1.14, a: 0, n: 270 });
      segs.push({ x: cx, y: bh, len: sl * 1.14, a: 0, n: 90 });
    }
    const corners = [[R, R, 180], [bw - R, R, 270], [bw - R, bh - R, 0], [R, bh - R, 90]];
    const N = 12, stepA = 90 / N, arcLen = (Math.PI / 180) * stepA * R * 1.16;
    corners.forEach(([ccx, ccy, a0]) => {
      for (let i = 0; i < N; i++) {
        const th2 = (a0 + (i + 0.5) * stepA) * Math.PI / 180;
        segs.push({ x: ccx + R * Math.cos(th2), y: ccy + R * Math.sin(th2), len: arcLen, a: (a0 + (i + 0.5) * stepA) + 90, n: a0 + (i + 0.5) * stepA });
      }
    });
    this.buildPartWalls();
    const kids = wr.children;
    for (let i = segs.length; i < kids.length; i++) kids[i].style.height = '0px';
    for (let i = 0; i < kids.length && i < segs.length; i++) {
      const s = segs[i], k = kids[i], t2 = thAt(s.x);
      k.dataset.n = s.n;
      k.style.width = s.len + 'px';
      k.style.height = t2 + 'px';
      k.style.transform = 'translate(' + (s.x - s.len / 2) + 'px,' + (s.y - t2 / 2) + 'px) rotateZ(' + s.a + 'deg) rotateX(90deg)';
    }
    // camera bump: a real cylinder wall per lens, in the z plane
    [this.ring1, this.ring2, this.ring3].forEach(rw => {
      const e = rw.current; if (!e || !e.clientWidth) return;
      const s = e.clientWidth, rad = s / 2 - 1, d = 12, M = e.children.length;
      const seg = (2 * Math.PI * rad / M) * 1.12;
      for (let i = 0; i < M; i++) {
        const a = (i + 0.5) * (360 / M);
        const rr = a * Math.PI / 180;
        const px = s / 2 + rad * Math.cos(rr), py = s / 2 + rad * Math.sin(rr);
        const k = e.children[i];
        k.style.width = seg + 'px';
        k.style.height = d + 'px';
        k.style.transform = 'translate(' + (px - seg / 2) + 'px,' + (py - d / 2) + 'px) translateZ(' + (d / 2) + 'px) rotateZ(' + (a + 90) + 'deg) rotateX(90deg)';
      }
    });
  }
  applyTheme() {
    const n = this.state.night;
    const root = this.cRef.current; if (!root) return;
    root.classList.toggle('is-night', n);
    const bg = n ? this.bgNight() : this.bgDay();
    root.style.background = bg;
    if (this.mat.current) this.mat.current.style.background = bg;
    const dot = n ? 'rgba(210,210,216,0.30)' : 'rgba(51,65,85,0.42)';
    const t1 = n ? 'rgba(228,228,232,0.26)' : 'rgba(15,23,42,0.20)';
    const t2 = n ? 'rgba(228,228,232,0.42)' : 'rgba(15,23,42,0.32)';
    const t3 = n ? 'rgba(228,228,232,0.62)' : 'rgba(15,23,42,0.46)';
    if (this.matDots.current) this.matDots.current.style.backgroundImage = 'radial-gradient(circle,' + dot + ' 1px,transparent 1.5px)';
    [this.axX, this.axY].forEach(a => { if (a.current) a.current.style.background = n ? 'rgba(214,214,220,0.40)' : 'rgba(15,23,42,0.30)'; });
    if (this.matBot.current) this.matBot.current.style.backgroundImage = 'repeating-linear-gradient(90deg,' + t1 + ' 0 1px,transparent 1px var(--mm)),repeating-linear-gradient(90deg,' + t2 + ' 0 1px,transparent 1px var(--cm)),repeating-linear-gradient(90deg,' + t3 + ' 0 2px,transparent 2px var(--cm))';
    if (this.matLeft.current) this.matLeft.current.style.backgroundImage = 'repeating-linear-gradient(0deg,' + t1 + ' 0 1px,transparent 1px var(--mm)),repeating-linear-gradient(0deg,' + t2 + ' 0 1px,transparent 1px var(--cm)),repeating-linear-gradient(0deg,' + t3 + ' 0 2px,transparent 2px var(--cm))';
    root.querySelectorAll('img[data-mod]').forEach(el => {
      const m = el.getAttribute('data-mod');
      const keepDark = m === 'lens';   // only the glass stays black in both themes
      if (m === 'frame') { el.style.filter = n ? 'grayscale(1) invert(1)' : 'grayscale(1)'; return; }
      el.style.filter = keepDark ? 'grayscale(1)' : (n ? 'grayscale(1) invert(1)' : 'grayscale(1)');
    });
    const sideCol = n ? '#DCDCDF' : '#0D1420';
    if (this.walls.current) { const kk = this.walls.current.children; for (let i = 0; i < kk.length; i++) kk[i].style.backgroundColor = sideCol; }
    [this.ring1, this.ring2, this.ring3].forEach(w => { if (!w.current) return;
      const rr = w.current.children;
      for (let i = 0; i < rr.length; i++) rr[i].style.backgroundColor = '#08080A'; });
    if (this.backPanel.current) this.backPanel.current.style.background = n ? 'rgba(13,13,14,0.94)' : 'rgba(255,255,255,0.94)';
    if (this.frontShell.current) {
      this.frontShell.current.style.borderColor = n ? '#8896AC' : '#0F172A';
      this.frontShell.current.style.background = n ? '#151516' : '#F5F7FB';
    }
    [this.nubVol, this.nubPwr].forEach(b => { if (b.current) b.current.style.background = n ? '#141416' : '#05070C'; });
    if (this.sfx.current) { const ll = this.sfx.current.children; for (let i = 0; i < ll.length; i++) ll[i].style.background = n ? '#E6E6E8' : '#0F172A'; }
    if (this.headMain.current) this.headMain.current.style.color = n ? '#F2F2F3' : '#0F172A';
    if (this.gHead.current) this.gHead.current.style.color = n ? '#F2F2F3' : '#0F172A';
    if (this.gl1.current) this.gl1.current.setAttribute('stroke', n ? '#3A3A3E' : '#94A3B8');
    if (this.gl2.current) this.gl2.current.setAttribute('stroke', n ? '#3A3A3E' : '#94A3B8');
    if (this.gHint.current) this.gHint.current.style.color = n ? '#6E6E74' : '#94A3B8';
    if (this.nightBtn.current) {
      this.nightBtn.current.style.background = n ? '#1C1C1F' : '#E4E9F0';
      this.nightBtn.current.style.borderColor = n ? '#3C3C41' : '#C3CBD8';
    }
    if (this.nightKnob.current) {
      this.nightKnob.current.style.transform = 'translateX(' + (n ? 24 : 0) + 'px)';
      this.nightKnob.current.style.background = n ? '#BCBCC1' : '#FFFFFF';
    }
  }
  grey(v) { const x = Math.max(0, Math.min(255, Math.round(v * 2.55))).toString(16).padStart(2, '0'); return '#' + x + x + x; }
  bgDay() { return this.grey(this.props.lightBg ?? 97); }
  bgNight() { return this.grey(this.props.darkBg ?? 9); }
  applyProps() {
    if (this.gFill.current) this.gFill.current.style.background = '#2F5BFF';
    if (this.gBtn.current) this.gBtn.current.style.color = '#ffffff';
    if (this.cRef.current) this.cRef.current.style.height = (this.props.scrollLength ?? 340) + 'vh';
  }
  draw(p) {
    const r = this.ramp.bind(this), ez = this.easeOut;
    const w = this.frontShell.current ? this.frontShell.current.clientWidth : 0;
    const T = w * 0.05106;   // half of 7.2 mm against a 70.5 mm body
    const theta = 360 * r(p, 0.02, 0.86) + this.over;
    const shellIn = r(theta, 1, 78);
    // leans toward the viewer across the middle of the turn, level at both ends.
    // declared here because the rail glare reads it too
    const lw = Math.min(r(theta, 4, 76), 1 - r(theta, 310, 358));
    const lean = -(5 + 5 * lw * lw * (3 - 2 * lw));
    // reflection model shared by glass, lenses and component faces.
    // f = signed angle off head-on for that face (-90..90); the band sweeps continuously across the
    // whole visible arc and the intensity dies square-on and at edge-on alike.
    const glareOf = (faceAt) => {
      let d = ((theta - faceAt) % 360 + 540) % 360 - 180;      // -180..180
      if (Math.abs(d) >= 90) return null;                       // that face is turned away
      const s2 = Math.sin(Math.abs(d) * Math.PI / 180), c2 = Math.cos(d * Math.PI / 180);
      const u2 = (d + 90) / 180;                                // 0 at one edge-on, 1 at the other
      return { k: Math.pow(s2, 1.6) * Math.pow(c2, 0.45), u: u2 };
    };
    const ct = Math.cos(theta * Math.PI / 180), st = Math.sin(theta * Math.PI / 180);
    const press = r(theta, 170, 179) - r(theta, 182, 196);
    if (w) {
      const sceneH = this.scene.current ? this.scene.current.clientHeight : 700;
      const cm = 2 * Math.round(sceneH / 29.38), hcm = cm / 2;
      if (this.mat.current) {
        this.mat.current.style.setProperty('--cm', cm + 'px');
        this.mat.current.style.setProperty('--mm', (cm / 10).toFixed(3) + 'px');
        this.mat.current.style.setProperty('--hcm', hcm + 'px');
      }
      const GAP = 3;                       // just enough to clip the tick that would sit on the origin
      const p0 = Math.round(cm * 0.2);
      const pad = p0 + 'px', padG = (p0 + GAP) + 'px';

      if (this.matDots.current) {
        const ds = this.matDots.current.style;
        ds.inset = 'auto'; ds.top = '0px'; ds.right = '0px'; ds.left = p0 + 'px'; ds.bottom = p0 + 'px';
        ds.backgroundPosition = (-hcm) + 'px calc(100% + ' + hcm + 'px)';
        const mk = 'radial-gradient(circle 3px at 0px 100%,transparent 0 100%,#000 100%),linear-gradient(#000,#000)';
        this.matDots.current.style.webkitMaskImage = mk;
        this.matDots.current.style.maskImage = mk;
        this.matDots.current.style.webkitMaskComposite = 'source-in';
        this.matDots.current.style.maskComposite = 'intersect';
      }
      if (this.matBot.current) this.matBot.current.style.backgroundPosition =
        (-GAP - 0.5) + 'px bottom, calc(var(--hcm) - ' + (GAP + 0.5) + 'px) bottom, ' + (-GAP - 1) + 'px bottom';
      if (this.matLeft.current) this.matLeft.current.style.backgroundPosition =
        'left calc(100% + ' + (GAP + 0.5) + 'px), left calc(100% - var(--hcm) + ' + (GAP + 0.5) + 'px), left calc(100% + ' + (GAP + 1) + 'px)';
      if (this.axX.current) { const s = this.axX.current.style; s.left = pad; s.right = '0px'; s.bottom = pad; }
      if (this.axY.current) { const s = this.axY.current.style; s.left = pad; s.bottom = pad; s.top = '0px'; }
      // origin at (0.3cm, 0.3cm) from the bottom-left corner
      // rulers stop on the last whole centimetre so no half tick is clipped at the screen edge
      if (this.matBot.current) { const s = this.matBot.current.style; s.left = padG; s.right = '0px'; s.width = 'auto'; s.bottom = pad; }
      if (this.matLeft.current) { const s = this.matLeft.current.style; s.top = '0px'; s.bottom = padG; s.height = 'auto'; s.left = pad; }
      // body thickness grows steadily across the first quarter turn
      const tN = 0.05 + 0.95 * r(theta, 0, 90), tF = tN;
      const Tb = T * tN, Tf = T * tN, Tt = 2 * T * tN;
      const R = w * 0.1146;
      this.frontShell.current.style.borderRadius = R + 'px';
      this.gScreen.current.style.borderRadius = (w * 0.103) + 'px';
      this.backPanel.current.style.borderRadius = R + 'px';
      this.faceFront.current.style.transform = 'translateZ(' + Tf + 'px)';
      this.faceBack.current.style.transform = 'translateZ(' + (-Tb) + 'px) rotateY(180deg)';

      if (this._wallW !== w || this._tF == null || Math.abs(this._tF - tF) > 0.02 || Math.abs(this._tN - tN) > 0.02) {
        this._tF = tF; this._tN = tN; this.buildWalls(); this.applyTheme(); this._wallW = w;
      }
      // geometry darkens in from the paper colour rather than fading, so overlapping edges never stack up
      const nn = this.state.night;
      const bgc = nn ? this.bgNight() : this.bgDay();
      const btnCol = nn ? '#141416' : '#05070C';
      const ga = Math.min(1, shellIn * 5);
      // brushed aluminium: a real grain texture over the anodised base colour
      // matte anodised rail. each segment is shaded ACROSS its depth as a rounded chamfer,
      // so the highlight sits at a different place on the profile depending on the light angle
      const lo = nn ? '#74767C' : '#040404', hi = nn ? '#EBEBEE' : '#3A3A3C';
      const LX = -0.54, LY = -0.55, LZ = 0.64;
      const PHI = [-52, -26, -6, 14, 34, 54];            // back edge -> front edge across the rail
      const STOP = ['0%', '17%', '36%', '58%', '80%', '100%'];
      const kk = this.walls.current.children;
      for (let i = 0; i < kk.length; i++) {
        const k2 = kk[i];
        k2.style.opacity = ga;
        const na = (+k2.dataset.n || 0) * Math.PI / 180;
        const nx = Math.cos(na), ny = Math.sin(na);
        let g = 'linear-gradient(to bottom';
        for (let j = 0; j < PHI.length; j++) {
          const ph = PHI[j] * Math.PI / 180, cp = Math.cos(ph), sp = Math.sin(ph);
          const wx = nx * cp * ct + sp * st, wy = ny * cp, wz = -nx * cp * st + sp * ct;
          const d2 = wx * LX + wy * LY + wz * LZ;
          const hl = Math.hypot(LX, LY, LZ + 1);
          const sp2 = Math.pow(Math.max(0, (wx * LX + wy * LY + wz * (LZ + 1)) / hl), 22);
          const b = Math.min(1, 0.05 + 0.95 * Math.pow(0.5 + 0.5 * d2, 2.3) + 0.28 * sp2);
          g += ',' + this.mix(bgc, this.hex(lo, hi, b), shellIn, 1) + ' ' + STOP[j];
        }
        const nDeg = +k2.dataset.n || 0;
        const long = nDeg === 0 || nDeg === 180;
        if (long) {
          const q = ((theta % 90) + 90) % 90 / 90;                  // one pass per quarter turn
          const gp = 118 - 136 * q + (this.tilt + lean) * 1.2;
          const st2 = Math.abs(Math.sin(theta * Math.PI / 180));    // nothing face-on
          // the key light is up and to the LEFT, so only a rail whose face turns leftward catches it
          const faceL = Math.max(0, -(Math.cos(nDeg * Math.PI / 180) * ct));
          // and it dies out as it reaches either end of its run
          const endFade = Math.max(0, Math.min(1, gp / 20)) * Math.max(0, Math.min(1, (100 - gp) / 20));
          const gA = (nn ? 0.13 : 0.095) * Math.min(1, st2 * 2.6) * Math.min(1, faceL * 2.2) * endFade;
          const A = k => 'rgba(255,255,255,' + (gA * k).toFixed(3) + ')';
          const dia = nDeg === 180 ? '110deg' : '250deg';          // same rake as the display glare, mirrored
          const bell = 'linear-gradient(' + dia + ',' + A(0) + ' 0%,' + A(0.06) + ' 18%,' + A(0.3) + ' 33%,'
            + A(0.72) + ' 43%,' + A(1) + ' 50%,' + A(0.72) + ' 57%,' + A(0.3) + ' 67%,' + A(0.06) + ' 82%,' + A(0) + ' 100%)';
          k2.style.backgroundImage = bell + ',' + g + ')';
          k2.style.backgroundSize = '16% 100%,100% 100%';
          k2.style.backgroundPosition = gp.toFixed(1) + '% 0,0 0';
          k2.style.backgroundRepeat = 'no-repeat,no-repeat';
        } else {
          k2.style.backgroundImage = g + ')';
          k2.style.backgroundSize = '100% 100%';
          k2.style.backgroundPosition = '0 0';
        }
        k2.style.backgroundColor = 'transparent';
      }
      // S25 hard numbers against the 7.2 mm body: 2.6 mm across the rail, 0.75 mm proud
      const mm = 2 * T / 7.2;
      const btnW = 2.6 * mm, proud = Math.max(1.3, 0.62 * mm);
      const zc = (Tf - Tb) / 2;                          // the block straddles the case's mid-plane
      const faceCol = nn ? '#C6C6CC' : '#2B2B2E', capCol = nn ? '#9B9BA2' : '#17171A';
      [['btnVol', 0], ['btnPwr', press]].forEach(([key, pz]) => {
        const g = this[key].current; if (!g) return;
        const push = proud * (1 - 1.25 * pz);             // presses past flush into the rail
        const out = Math.max(0.4, push);
        g.style.width = out.toFixed(2) + 'px';           // the block itself grows out of the rail
        g.style.opacity = 1;
        g.style.transform = 'translateZ(' + zc.toFixed(2) + 'px)';
        // contact shadow on the rail, tight to the block and deeper as it presses in
        const sh = this[key + 'S'].current;
        if (sh) {
          const lip = Math.max(0.6, btnW * 0.11);
          sh.style.width = (btnW + 2 * lip).toFixed(2) + 'px';
          sh.style.top = (-lip).toFixed(2) + 'px';
          sh.style.bottom = (-lip).toFixed(2) + 'px';
          sh.style.borderRadius = ((btnW + 2 * lip) / 2).toFixed(2) + 'px';
          sh.style.transform = 'translateZ(' + (btnW / 2 + lip).toFixed(2) + 'px) rotateY(90deg)';
          sh.style.opacity = ga.toFixed(3);
          sh.style.background = 'transparent';
          sh.style.border = '0.7px solid ' + this.mix(bgc, nn ? '#9C9CA4' : '#1A1F29', shellIn, ga * 0.6);
          sh.style.boxSizing = 'border-box';
          sh.style.boxShadow = 'none';
        }
        const wCol = this.mix(bgc, nn ? '#AFAFB6' : '#232326', shellIn, ga);
        const f = this[key + 'F'].current;
        if (f) {
          f.style.width = btnW.toFixed(2) + 'px';
          f.style.borderRadius = (btnW * 0.5).toFixed(2) + 'px';
          f.style.boxShadow = '0 0 0 0.8px ' + this.mix(bgc, '#05060A', shellIn, ga);
          f.style.background = 'linear-gradient(90deg,'
            + this.mix(bgc, nn ? '#D8D8DE' : '#34343A', shellIn, ga) + ' 0%,'
            + this.mix(bgc, faceCol, shellIn, ga) + ' 22%,'
            + this.mix(bgc, faceCol, shellIn, ga) + ' 78%,'
            + this.mix(bgc, nn ? '#A6A6AD' : '#1D1D21', shellIn, ga) + ' 100%)';
          f.style.transform = 'translateX(' + out.toFixed(2) + 'px) translateZ(' + (btnW / 2).toFixed(2) + 'px) rotateY(90deg)';
        }
        // near and far walls in the xy plane: what you see when the back faces you
        [['N', 1], ['R', -1]].forEach(([sfx2, dir]) => {
          const wEl = this[key + sfx2].current; if (!wEl) return;
          wEl.style.background = wCol;
          wEl.style.width = out.toFixed(2) + 'px';
          wEl.style.borderRadius = '0';
          wEl.style.boxShadow = 'none';
          wEl.style.transform = 'translateZ(' + (dir * btnW / 2).toFixed(2) + 'px)';
        });
        // caps in the xz plane close the ends off
        [['T', -1], ['B', 1]].forEach(([sfx2, dir]) => {
          const cEl = this[key + sfx2].current; if (!cEl) return;
          cEl.style.height = btnW.toFixed(2) + 'px';
          cEl.style.width = out.toFixed(2) + 'px';
          cEl.style.borderRadius = '0';
          cEl.style.boxShadow = 'none';
          cEl.style.background = this.mix(bgc, capCol, shellIn, ga);
          cEl.style.transform = 'translateZ(' + (btnW / 2).toFixed(2) + 'px) rotateX(' + (dir * 90) + 'deg)';
        });
      });
      const plateZ = -0.5 * Tt;                     // flush with the case's back face
      if (this.pFrame.current) this.pFrame.current.style.transform = 'translateZ(' + plateZ.toFixed(2) + 'px)';
      if (this.pRim.current) this.pRim.current.style.transform = 'translateZ(' + (plateZ + 0.30 * Tt).toFixed(2) + 'px)';
      if (this.backPanel.current) this.backPanel.current.style.transform = 'translateZ(' + (plateZ - 1.2).toFixed(2) + 'px)';
      const shellCol = nn ? '#C8C8CE' : '#0F172A';
      this.frontShell.current.style.borderColor = this.mix(bgc, shellCol, shellIn, ga);
      const disp = ez(r(theta, 26, 78));       // display panel is installed during the first quarter turn
      const det = Math.max(disp, r(theta, 252, 292));
      const slide = (1 - disp) * w * 1.15;
      [this.fpBezel, this.gScreen].forEach(el2 => {
        if (el2.current) { el2.current.style.transform = 'translateX(' + slide.toFixed(1) + 'px)'; el2.current.style.opacity = disp; }
      });
      const fa = shellIn;
      const cHi = nn ? '235,235,238' : '92,92,95', cMid = nn ? '208,208,213' : '34,34,36', cLo = nn ? '150,150,157' : '6,6,7';
      this.frontShell.current.style.background = 'none';
      this.frontShell.current.style.borderRadius = R + 'px';
      if (this.fpBezel.current) { this.fpBezel.current.style.background = this.mix(bgc, nn ? '#050506' : '#05070C', shellIn, ga * det); this.fpBezel.current.style.borderRadius = (R * 0.90) + 'px';
        if (this.fpCav.current) {
          this.fpCav.current.style.borderRadius = (R * 0.90) + 'px';
          const band = Math.max(1.5, w * 0.0155);
          this.fpCav.current.style.boxShadow = '0 0 0 ' + band.toFixed(2) + 'px rgba(' + cMid + ',' + fa + ')';
        }
        this.fpBezel.current.style.boxShadow = '0 0 0 0.75px ' + this.mix(bgc, nn ? '#EFEFF2' : '#9A9A9F', shellIn, ga * 0.75); }
      [this.nubVol, this.nubPwr].forEach(b => { if (b.current) b.current.style.background = this.mix(bgc, btnCol, shellIn, ga); });
      if (this.gScreen.current) this.gScreen.current.style.borderColor = this.mix(bgc, shellCol, shellIn, ga * det);
      if (this.fpSlit.current) this.fpSlit.current.style.background = this.mix(bgc, shellCol, shellIn, ga);   // grill belongs to the frame
      if (this.fpHole.current) this.fpHole.current.style.background = this.mix(bgc, '#08080A', shellIn, ga * det);
      if (this.sfx.current) {
        const bIn = r(theta, 166, 179), bOut = r(theta, 180, 194), bFade = r(theta, 192, 216);
        const kk = this.sfx.current.children, n2 = kk.length;
        this.sfx.current.style.opacity = bIn * (1 - bFade);
        const off = 5 - 3.4 * bIn + 13 * bOut, sx = 0.30 + 0.16 * bIn + 0.9 * bOut;
        for (let i = 0; i < n2; i++) {
          kk[i].style.transform = 'rotate(' + (-30 + i * 30) + 'deg) translateX(' + off.toFixed(2) + 'px) scaleX(' + sx.toFixed(3) + ')';
        }
      }
    }
    const hr = r(p, 0.02, 0.13);
    if (this.gHead.current) {
      this.gHead.current.style.opacity = 1 - hr;
      this.gHead.current.style.transform = 'translate(-50%, calc(-50% - ' + (48 * hr) + 'px))';
    }
    if (this.gHint.current) this.gHint.current.style.opacity = 1 - r(p, 0, 0.06);
    if (this.stage.current) this.stage.current.style.transform = 'rotateX(' + (this.tilt + lean).toFixed(2) + 'deg) rotateY(' + theta + 'deg)';
    const facing = Math.cos(theta * Math.PI / 180);
    if (this.faceFront.current) this.faceFront.current.style.opacity = facing > -0.02 ? 1 : 0;
    // the back face stays live so parts flying in from the left are visible before the phone turns past 90
    const backShell = facing < 0.02 ? shellIn : 0;
    if (this.faceBack.current) this.faceBack.current.style.opacity = 1;
    if (this.backPanel.current) this.backPanel.current.style.opacity = backShell;
    if (this.pFrame.current) this.pFrame.current.style.opacity = backShell;
    if (this.pRim.current) this.pRim.current.style.opacity = backShell;
    const seen = r(theta, 78, 92);   // nothing on the back face reads until we are past edge-on
    this.parts.forEach(pt => {
      const el = this[pt.r].current; if (!el) return;
      const tt = r(theta, pt.a0, pt.a1);
      // leaves fast and decelerates the whole way in, coasting to a stop against the body
      const k = Math.pow(1 - tt, 2.6);
      const e = ez(Math.min(1, tt / 0.4)) * seen;   // fades in mid-flight, once the back face turns toward us
      // parts hold the phone's own orientation, with only a slight tilt while travelling
      const dmm = this.depth[pt.r];
      const dpx = (dmm || 0.8) * (2 * T / 7.2);
      // the component's BACK face rests on the base plate; its body stands up off it toward the viewer
      const off = (this.baseOff[pt.r] || 0) * (2 * T / 7.2);
      const rz = dmm ? (-0.98 * T + off + dpx) : -(this.zIn[pt.r] || 0) * 2 * T;
      const D = pt.dx * k;
      // face-on to the viewer while panning in, then swings onto the phone's own rotation as it locks
      // screen-space rotation is FROZEN at the angle it will hold when it seats (pt.a1), so nothing
      // rotates during the slide; at touchdown theta === a1, the offset is zero and it silently joins the phone
      // leaves the left edge at 70 deg off face-on (world 110), then turns onto the phone across the whole slide
      const hold = (theta - 110) * Math.pow(Math.max(0, 1 - tt / 0.8), 1.6);
      el.style.transform = 'translate3d(' + (D * ct).toFixed(2) + 'px,0,' + (rz - D * st).toFixed(2) + 'px) rotateY(' + hold.toFixed(2) + 'deg)';
      {
        const wLo = this.state.night ? '#3A3A3C' : '#909096', wHi = this.state.night ? '#7A7A80' : '#DCDCE0';
        const dHead = Math.min(Math.abs(theta), Math.abs(theta - 360), Math.abs(theta + 360));
        const wOp = e * (1 - 0.62 * (1 - Math.min(1, dHead / 55)));
        const pw = el.children;
        const hid = wOp < 0.004;
        if (hid && el.dataset.wh === '1') { /* already hidden */ } else {
        el.dataset.wh = hid ? '1' : '0';
        for (let i = 0; i < pw.length; i++) {
          const kd = pw[i];
          if (!kd.dataset || !kd.dataset.pwall) continue;
          if (hid) { kd.style.opacity = 0; continue; }
          const na = (+kd.dataset.n || 0) * Math.PI / 180;
          const nx = -Math.cos(na), ny = Math.sin(na);
          const d2 = (nx * ct) * -0.54 + ny * -0.55 + (-nx * st) * 0.64;
          kd.style.opacity = wOp;
          kd.style.background = this.hex(wLo, wHi, 0.10 + 0.90 * Math.pow(0.5 + 0.5 * d2, 2.1));
        }
        }
      }
      if (el.tagName === 'IMG') { el.style.opacity = e; return; }
      if (pt.r === 'camWrap') {
        if (this.camBase.current) this.camBase.current.style.opacity = e;
      } else if (pt.r.slice(0, 4) === 'camB') {
        // NB: no mix-blend-mode here — blending flattens the preserve-3d subtree and kills the barrels
        const n2 = pt.r.slice(4);
        const li = this['lens' + n2], rw = this['ring' + n2];
        if (li && li.current) li.current.style.opacity = e;
        const rb = this.state.night ? this.bgNight() : this.bgDay();
        if (rw && rw.current) {
          const rr = rw.current.children;
          for (let i = 0; i < rr.length; i++) { rr[i].style.opacity = 1; rr[i].style.background = this.mix(rb, '#08080A', e, Math.min(1, e * 5)); }
        }
        // same raking band as the display, sweeping across the glass as the back turns past us
        if (el) {
          const lgs = el.querySelectorAll('[data-lensglare]');
          const gB = glareOf(180);
          for (let i = 0; i < lgs.length; i++) {
            lgs[i].style.opacity = gB ? Math.min(0.32, 0.55 * gB.k) * e : 0;
            const ul = 1 - ((2 * (gB ? gB.u : 0.5)) % 1);
            lgs[i].style.backgroundPosition = (-10 + 118 * ul).toFixed(1) + '% ' + (4 + 92 * ul + this.tilt * 1.6).toFixed(1) + '%';
          }
        }
      } else {
        // extrusion: the part's own outline, stacked down to the base plate, so the wall follows the
        // real silhouette (rounded corners, the battery's coil boss) instead of two flat side quads
        const kids = el.children;
        let nRim = 0;
        for (let i = 0; i < kids.length; i++) if (kids[i].dataset && kids[i].dataset.rim) nRim++;
        const step = dpx / nRim;
        const rimF = this.state.night ? 'invert(1)' : 'none';
        // only the outermost edge is drawn: stacking translucent copies multiplied their ink
        // and made every part read far darker than the scan
        const thin = pt.r === 'mCoil';                 // too thin for walls: keep the offset outline
        let seenRim = 0;
        for (let i = 0; i < kids.length; i++) {
          const kd = kids[i];
          if (kd.dataset && kd.dataset.pwall) {
            continue;
          } else if (kd.dataset && kd.dataset.rim) {
            seenRim++;
            if (seenRim === nRim) {
              kd.style.opacity = thin ? e * Math.abs(st) * 0.8 : 0;
              kd.style.filter = rimF;
              kd.style.transform = 'translateZ(' + (-dpx * (thin ? 0.55 : 1)).toFixed(2) + 'px)';
            } else {
              kd.style.opacity = 0;
            }
          } else if (kd.dataset && kd.dataset.modglare) {
            const gB2 = glareOf(180);
            kd.style.opacity = gB2 ? Math.min(0.128, 0.216 * gB2.k) * e : 0;
            // the diagonal mirrors either side of face-on, so it always rakes with the turn
            const flip = (gB2 ? gB2.u : 0.5) < 0.5;
            if (kd.dataset.flip !== String(flip)) {
              kd.dataset.flip = String(flip);
              kd.style.backgroundImage = 'linear-gradient(' + (flip ? 234 : 126) + 'deg,rgba(255,255,255,0) 32%,rgba(255,255,255,0.55) 45%,rgba(255,255,255,0.10) 50%,rgba(255,255,255,0.28) 55%,rgba(255,255,255,0) 68%)';
            }
            const ub = 1 - ((2 * (gB2 ? gB2.u : 0.5)) % 1);
            kd.style.backgroundPosition = (-10 + 118 * ub).toFixed(1) + '% ' + (4 + 92 * ub + this.tilt * 1.6).toFixed(1) + '%';
          } else {
            kd.style.opacity = e;
          }
        }
      }
    });
    const gv = (this.props.showGuides ?? true) ? Math.max(0, r(theta, 10, 74) - r(theta, 214, 246)) : 0;
    if (this.gGuides.current) this.gGuides.current.style.opacity = 0.45 * gv;
    // the screen is already black and booted before the front swings back into view
    const bootIn = r(theta, 196, 246), heroIn = ez(r(theta, 297, 331));
    if (this.gBoot.current) this.gBoot.current.style.opacity = bootIn;
    if (this.gBootTxt.current) this.gBootTxt.current.style.opacity = 1 - ez(r(theta, 291, 315));
    if (this.gFill.current) this.gFill.current.style.opacity = bootIn * heroIn;
    // raking glare across the display, strongest off-angle and gone when you face it square on
    if (this.gGlare.current) {
      // driven by the actual viewing angle: a reflection only builds as the glass rakes away from
      // you, dies face-on, and its band tracks sin(theta) so it sweeps with the turn
      const gF = glareOf(0);
      const tiltTot = this.tilt + lean;
      this.gGlare.current.style.opacity = gF ? Math.min(0.147, 0.256 * gF.k) : 0;
      // the glare is only ON for the last ~70 deg of the turn, so the band has to traverse the glass
      // across THAT arc, not across the full +-90: u = 0 at edge-on, 1 head-on
      // travels the full width across the arc where it is actually bright (80 deg -> 10 deg)
      const u = gF ? gF.u : 0.5;
      this.gGlare.current.style.backgroundPosition = (-10 + 236 * u).toFixed(1) + '% ' + (4 + 184 * u + tiltTot * 2.4).toFixed(1) + '%';
    }
    const o = r(theta, 300, 358);
    if (this.gCta.current) {
      this.gCta.current.style.opacity = 1;
      this.gCta.current.style.pointerEvents = o > 0.7 ? 'auto' : 'none';
      // overlapping top-to-bottom cascade
      [this.gL1, this.gL2, this.gL3, this.gBtn].forEach((it, i) => {
        if (!it.current) return;
        const t = ez(Math.min(1, Math.max(0, (o - i * 0.115) / 0.6)));
        it.current.style.opacity = t;
        it.current.style.transform = (i === 3 ? 'translateX(-50%) ' : '') + 'translateY(' + (18 * (1 - t)).toFixed(1) + 'px)';
      });
    }
  }
  componentDidMount() {
    this.initVanta();
    window.addEventListener('scroll', this.onScroll, { passive: true });
    window.addEventListener('resize', this.onScroll);
    const st = this.stick.current;
    st.addEventListener('pointerdown', this.onDown);
    st.addEventListener('pointermove', this.onMove);
    st.addEventListener('pointerup', this.onUp);
    st.addEventListener('pointercancel', this.onUp);
    st.addEventListener('wheel', this.onWheel, { passive: false });
    this.nightBtn.current.addEventListener('click', this.toggleNight);
    this.applyProps();
    this.measure(); this.cur = this.target;
    this.buildWalls(); this.applyTheme(); this.draw(this.cur);
  }
  componentDidUpdate() { this.initVanta(); this.applyProps(); this.buildWalls(); this.applyTheme(); this.draw(this.cur); }
  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
    window.removeEventListener('resize', this.onScroll);
    const st = this.stick.current;
    if (st) { st.removeEventListener('pointerdown', this.onDown); st.removeEventListener('pointermove', this.onMove); st.removeEventListener('pointerup', this.onUp); st.removeEventListener('pointercancel', this.onUp); st.removeEventListener('wheel', this.onWheel); }
    if (this.nightBtn.current) this.nightBtn.current.removeEventListener('click', this.toggleNight);
    cancelAnimationFrame(this.raf); cancelAnimationFrame(this.flingRaf || 0); this.raf = 0; this.flingRaf = 0;
    if (this.vanta) { try { this.vanta.destroy(); } catch (e) {} this.vanta = null; }
  }

}
