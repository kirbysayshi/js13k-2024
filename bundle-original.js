(function () {
  'use strict';

  // Function Bivariance Hack!
  // https://stackoverflow.com/a/52668133

  function isEvHandlerCallback(match, v) {
    return match !== null && typeof v === 'function';
  }
  function isRefHandler(match, v) {
    return match !== null && typeof v === 'function';
  }
  function isString(v) {
    return typeof v === 'string';
  }
  function isNumber(v) {
    return typeof v === 'number';
  }
  function isElementLike(v) {
    return v !== null && typeof v !== 'string' && typeof v !== 'number' && typeof v !== 'function' && !Array.isArray(v) && 'nodeType' in v;
  }
  function stract(strings, ...interps) {
    let finals = [];
    let refs = [];
    let events = [];
    let elements = [];
    for (let i = 0; i < strings.length; i++) {
      let str = strings[i];
      let interp = interps[i];

      // Look for a Ref
      let refMatch = str.match(/ref="?$/);
      // Look for an event handler
      let eventMatch = str.match(/on([a-z]+)="?/);
      // generate a unique-ish id.
      let key = 'xxxxxxxxxxxx'.replace(/x/g, () => Math.floor(Math.random() * 16).toString(16));
      if (interp === undefined) {
        // interp could be undefined
        finals.push(str);
      } else if (isRefHandler(refMatch, interp)) {
        refs.push({
          key,
          cb: interp
        });
        finals.push(str, key);
      } else if (isEvHandlerCallback(eventMatch, interp)) {
        if (!eventMatch) throw new Error('Unreachable');
        let eventName = eventMatch[1];
        events.push({
          key,
          name: eventName,
          cb: interp
        });
        finals.push(str, key);
      } else if (isString(interp)) {
        finals.push(str, interp);
      } else if (isNumber(interp)) {
        finals.push(str, String(interp));
      } else if (isElementLike(interp)) {
        elements.push({
          key,
          el: interp
        });
        finals.push(str, `<span data-stract=${key}></span>`);
      } else if (Array.isArray(interp)) {
        finals.push(str);

        // It's repetitious, but simpler than recursing, for now... I think.

        for (let j = 0; j < interp.length; j++) {
          let sub = interp[j];
          if (isString(sub)) {
            finals.push(sub);
          } else if (isNumber(sub)) {
            finals.push(String(sub));
          } else if (isElementLike(sub)) {
            elements.push({
              key,
              el: sub
            });
            finals.push(`<span data-stract=${key}></span>`);
          }
        }
      } else if (interp) {
        throw new Error(`Type ${typeof interp} is not a valid interpolation!`);
      } else {
        finals.push(str);
      }
    }
    let frag = document.createElement('template');
    frag.innerHTML = finals.join('');
    let {
      content
    } = frag;
    events.forEach(desc => {
      let attr = `on${desc.name}`;
      let selector = `[${attr}='${desc.key}']`;
      let el = content.querySelector(selector);
      el.removeAttribute(attr);
      el.addEventListener(desc.name, desc.cb);
    });
    elements.forEach(desc => {
      let selector = `[data-stract='${desc.key}']`;
      let el = content.querySelector(selector);
      if (Array.isArray(desc.el)) {
        let referenceNode = el;
        for (let i = 0; i < desc.el.length; i++) {
          insertAsNextSibling(referenceNode, desc.el[i]);
        }
        el.parentNode.removeChild(el);
      } else {
        el.parentNode.replaceChild(desc.el, el);
      }
    });
    refs.forEach(desc => {
      let selector = `[ref='${desc.key}']`;
      let el = content.querySelector(selector);
      el.removeAttribute('ref');
      desc.cb(el);
    });
    return content;
  }
  function insertAsNextSibling(refNode, futureSibling) {
    refNode.parentNode.insertBefore(futureSibling, refNode.nextSibling);
  }

  /**
   * Useful in dev for avoiding usage of the ! operator. Will be removed by rollup
   * before compression.
   */
  function assertDefinedFatal(value, context = '') {
    if (value == null || value === undefined) {
      throw new Error(`Fatal error: value ${value} ${context ? `(${context})` : ''} must not be null/undefined.`);
    }
  }

  let ticks1Hz = new Set();
  function register1HzTick(onTick) {
    ticks1Hz.add(onTick);
    return () => ticks1Hz.delete(onTick);
  }
  let ticks10Hz = new Set();
  let ticks100Hz = new Set();
  function register100HzTick(onTick) {
    ticks100Hz.add(onTick);
    return () => ticks10Hz.delete(onTick);
  }
  function run1HzTicks() {
    for (let tick of ticks1Hz) {
      tick();
    }
  }
  function run10HzTicks() {
    for (let tick of ticks10Hz) {
      tick();
    }
  }
  function run100HzTicks() {
    for (let tick of ticks100Hz) {
      tick();
    }
  }
  class BrowserIntervalCtrl {
    constructor() {}
    next = null;
    set(...args) {
      this.clear();
      this.next = setInterval(...args);
    }
    clear() {
      if (this.next) clearInterval(this.next);
    }
  }
  function autoRef() {
    let ref = {
      current: null
    };
    return [ref, el => ref.current = el];
  }
  function Friend(id, markFriendAsInactive, startingShame) {
    let [$, set$] = autoRef();
    let [progressRef, setProgressRef] = autoRef();
    let [progressLabel, setProgressLabel] = autoRef();
    register1HzTick(() => {
      if (progressRef.current && progressLabel.current) {
        progressRef.current.value += Math.random() > 0.75 ? 5 : 1;
        updateLabel();
        if (progressRef.current.value >= 100) {
          markUnrecoverable();
        }
      }
    });
    function updateLabel() {
      if (!progressRef.current || !progressLabel.current) return;
      if (progressRef.current.value >= 100) {
        progressLabel.current.style.backgroundColor = 'red';
        progressLabel.current.textContent = 'Shame Unrecoverable';
      } else if (progressRef.current.value > 90) {
        progressLabel.current.style.backgroundColor = 'red';
        progressLabel.current.textContent = 'Shame Critical!!!';
      } else if (progressRef.current.value <= 90) {
        progressLabel.current.style.backgroundColor = 'black';
        progressLabel.current.textContent = 'Shame OK';
      }
    }
    let topics = [];
    // let topicCount = 2;
    // for (let i = 0; i < topicCount; i++) {
    // let rand = Math.random();
    topics.push(generateTopic(2));
    topics.push(generateTopic(4));
    // }

    let recoverable = true;
    function markUnrecoverable() {
      recoverable = false;
      if (!$.current) return;
      $.current.style.opacity = '0.2';
      markFriendAsInactive(id);
    }
    function willAccept(ev) {
      if (!ev.dataTransfer) return false;
      if (!recoverable) return false;
      let topic = ev.dataTransfer.getData('text/plain');
      if (topics.find(t => t === topic)) return true;
      return false;
    }
    function onDragOver(ev) {
      if (willAccept(ev)) {
        ev.preventDefault();
      }
    }
    function onDrop(ev) {
      ev.preventDefault();
      let data = ev.dataTransfer?.getData('text/plain');
      if (!data) return;
      console.log(`Dropped ${data}`);
      let gs = getGameState();
      if (gs.dragTarget) {
        gs.dragTarget.remove();
        gs.dragTarget = null;
      }

      // reset styles
      let target = ev.currentTarget;
      target.style.backgroundColor = 'transparent';
      if (progressRef.current) progressRef.current.value -= data.length * 10;
      updateLabel();
    }
    function onDragEnter(ev) {
      if (!willAccept(ev)) return;
      console.log('drag enter');
      let target = ev.currentTarget;
      target.style.backgroundColor = 'blue';
    }
    function onDragLeave(ev) {
      console.log('drag leave');
      let target = ev.currentTarget;
      target.style.backgroundColor = 'transparent';
    }

    // NOTE: pointer-events: none is so that only the dropzone receives
    // onDragLeave. Otherwise the child elements will trigger it and cause the
    // styling to be reset.

    return stract`
    <div
      data-friendid=${id}
      ref=${set$}
      class="border-1"
      ondrop=${onDrop}
      ondragover=${onDragOver}
      ondragenter=${onDragEnter}
      ondragleave=${onDragLeave}
    >
      <div style="pointer-events:none;">
        <div style="position:relative; height: 2rem;">
          <meter
            ref=${setProgressRef}
            value=${startingShame}
            min=0
            optimium=0
            low="10"
            high=90
            max=100
            style="
              width: 100%;
              height: 1rem;
            "
          ></meter>
          <label
            ref=${setProgressLabel}
            style="
              position:absolute;
              right: 0;
              bottom: 0;
              background-color: black;
              text-transform: uppercase;
            "
          >Shame</label>
        </div>
        <ul>
          ${topics.map(topic => stract`<li>${topic}</li>`)}
        </ul>
      </div>
    </div>
  `;
  }
  function SharablesList() {
    register1HzTick(() => {
      let rand = Math.random();
      if (rand > 0.5) {
        // spawn new sharable
        list.current?.appendChild(Sharable());
      }
    });
    let list = {
      current: null
    };
    return stract`
    <div>
      <ul ref=${el => list.current = el}>
      </ul>
    </div>
  `;
  }
  let icons = [
  // large circle
  '\u25EF',
  // triangle,
  '\u25B3',
  // square
  '\u25FB',
  // cross
  '\u2715'];
  function generateTopic(length) {
    let topic = '';
    for (let i = 0; i < length; i++) {
      let rand = Math.random();
      let icon = icons[Math.floor(rand * icons.length)];
      topic = `${topic}${icon}`.split('').sort().join('');
    }
    return topic;
  }
  function Sharable() {
    // let rand = Math.random();
    let topic = generateTopic(Math.random() > 0.85 ? 4 : 2);
    function onDragStart(ev) {
      if (!ev.dataTransfer) return;
      ev.dataTransfer.dropEffect = 'move';
      ev.dataTransfer.setData('text/plain', topic);
      let target = ev.target;
      getGameState().dragTarget = target;
    }

    // Do styling here, as this event seems to fire after the clone has been made.
    function onDrag(ev) {
      let target = ev.target;
      target.style.outline = '1px solid red';
    }
    function onDragEnd(ev) {
      let target = ev.target;
      target.style.outline = '';
    }
    let age = 0;
    let maxAge = 10;
    let unregHz = register1HzTick(() => {
      if (!$.current) return;
      age += 1;

      // TODO: lerp
      $.current.style.opacity = `${1 - age / maxAge}`;
      if (age > maxAge) {
        $.current.remove();
        unregHz();
      }
    });
    let [$, set$] = autoRef();
    return stract`
    <li
      ref=${set$}
      draggable="true"
      ondragstart=${onDragStart}
      ondrag=${onDrag}
      ondragend=${onDragEnd}
    >
      <button>✥</button>
      ${topic}
    </li>
  `;
  }
  function fmtMsAsHHSSMM(ms) {
    let totalSeconds = ms / 1000;
    // let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor(totalSeconds % 3600 / 60);
    let seconds = Math.floor(totalSeconds % 60);
    let milliseconds = ms % 1000;
    return `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}.${milliseconds > 99 ? milliseconds : milliseconds > 9 ? `0${milliseconds}` : `00${milliseconds}`}`;
  }
  function AnxietyTicker(getTotalActiveFriendsCount, markAnxietyNotSustainedRef) {
    let [$time, set$time] = autoRef();
    let [$points, set$points] = autoRef();
    let [$label, set$label] = autoRef();
    let ms = 0;
    let points = 0;
    register100HzTick(() => {
      if (!$time.current || !$points.current || !sustained) return;
      ms += 10;
      $time.current.textContent = fmtMsAsHHSSMM(ms);
      points += getTotalActiveFriendsCount();
      $points.current.textContent = `${points} points`;
    });
    let sustained = true;
    function markAnxietyNotSustained() {
      ;
      sustained = false;
      $label.current.textContent = 'Anxiety Not Sustained';
      // $points.current.textContent = '';
      return {
        ms,
        points
      };
    }
    markAnxietyNotSustainedRef.current = markAnxietyNotSustained;
    return stract`
    <div
      style="
        display: flex;
        justify-content: center;
        align-items: center;
      "
    >
      <div style="position: relative;">
        <header
          ref=${set$label}
          style='
            position: absolute;
            left: 0;
            top: 0;
            background-color: black;
            text-transform: uppercase;
          '
        >Anxiety Sustaining</header>
        <div
          style="
            font-size: 5rem;
            font-variant-numeric: tabular-nums;
            font-family: monospace;
            font-weight: bold;
          "
          ref=${set$time}
        ></div>
        <div
          ref=${set$points}
        ></div>
      </div>
    </div>
  `;
  }
  function AnxietyNotSustained(animationCompleted, totalMs, totalPoints) {
    let [$, set$] = autoRef();
    let parts = `Anxiety Not Sustained`.split(' ');
    let sub = [`Anxiety lasted ${fmtMsAsHHSSMM(totalMs)}, ${totalPoints} points`];
    let off = register1HzTick(() => {
      if (parts.length === 0) {
        let part = sub.shift();
        if (!part) return;
        $.current?.appendChild(stract`<span style="font-size: 1rem;"><span style="background-color: black;">${part}</span></span>`);
        if (sub.length === 0) {
          off();
          animationCompleted();
          return;
        }
      }
      let part = parts.shift();
      if (!part) return;
      $.current?.appendChild(
      // double span so that the first is flex'ed, and the second is sized just
      // to the text
      stract`<span><span style="background-color: black;">${part}</span></span>`);
    });
    return stract`
    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0">
      <div
        ref=${set$}
        style="
          display: flex;
          flex-direction: column;
          gap: 1rem;
          font-size: 5rem;
          text-transform: uppercase;
        "
      ></div>
    </div>
  `;
  }
  function Root() {
    let ctrl1Hz = new BrowserIntervalCtrl();
    ctrl1Hz.set(() => {
      run1HzTicks();
    }, 1000);
    let ctrl10Hz = new BrowserIntervalCtrl();
    ctrl10Hz.set(() => {
      run10HzTicks();
    }, 100);
    let ctrl100Hz = new BrowserIntervalCtrl();
    ctrl100Hz.set(() => {
      run100HzTicks();
    }, 10);
    function stopTickers() {
      ctrl1Hz.clear();
      ctrl10Hz.clear();
      ctrl100Hz.clear();
    }
    window.addEventListener('keyup', ev => {
      if (ev.key === 'Escape') {
        stopTickers();
        console.log('halt');
      }
    });
    let friends = [{
      id: 'a',
      startingShame: 50
    }, {
      id: 'b',
      startingShame: 40
    }, {
      id: 'c',
      startingShame: 75
    }];
    function getTotalActiveFriendsCount() {
      return friends.length;
    }
    function animationCompleted() {
      stopTickers();
    }
    let markAnxietyNotSustainedRef = {
      current: null
    };
    function markFriendAsInactive(id) {
      let idx = friends.findIndex(f => f.id === id);
      if (idx === -1) return;
      friends.splice(idx, 1);
      if (friends.length === 0) {
        // end state
        let {
          ms,
          points
        } = markAnxietyNotSustainedRef.current?.() ?? {
          ms: 0,
          points: 0
        };
        $.current?.appendChild(AnxietyNotSustained(animationCompleted, ms, points));
      }
    }
    let [$, set$] = autoRef();
    return stract`
    <div ref=${set$} style="position: relative;">
      ${AnxietyTicker(getTotalActiveFriendsCount, markAnxietyNotSustainedRef)}
      ${friends.map(f => Friend(f.id, markFriendAsInactive, f.startingShame))}
      ${SharablesList()}
    </div>
  `;
  }
  let gameState = {
    dragTarget: null
  };
  function getGameState() {
    return gameState;
  }
  document.querySelector('body')?.appendChild(Root());

  // TODO: remove friend topics so there is just one or two per friend

})();
