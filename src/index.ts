import { stract } from './stract';
import { assertDefinedFatal } from './utils';

const ticks1Hz = new Set<() => void>();
function register1HzTick(onTick: () => void) {
  ticks1Hz.add(onTick);
  return () => ticks1Hz.delete(onTick);
}

const ticks10Hz = new Set<() => void>();
function register10HzTick(onTick: () => void) {
  ticks10Hz.add(onTick);
  return () => ticks10Hz.delete(onTick);
}

const ticks100Hz = new Set<() => void>();
function register100HzTick(onTick: () => void) {
  ticks100Hz.add(onTick);
  return () => ticks10Hz.delete(onTick);
}

function run1HzTicks() {
  for (const tick of ticks1Hz) {
    tick();
  }
}

function run10HzTicks() {
  for (const tick of ticks10Hz) {
    tick();
  }
}

function run100HzTicks() {
  for (const tick of ticks100Hz) {
    tick();
  }
}

class BrowserTimeoutCtrl {
  private next: ReturnType<typeof setTimeout> | null = null;

  set(...args: Parameters<typeof setTimeout>): void {
    this.clear();
    this.next = setTimeout(...args);
  }

  clear(): void {
    if (this.next) clearTimeout(this.next);
  }
}

class BrowserIntervalCtrl {
  constructor() {}
  private next: ReturnType<typeof setInterval> | null = null;

  set(...args: Parameters<typeof setInterval>): void {
    this.clear();
    this.next = setInterval(...args);
  }

  clear(): void {
    if (this.next) clearInterval(this.next);
  }
}

type Ref<T> = { current: T | null };

function autoRef<T>() {
  const ref: Ref<T> = { current: null };
  return [ref, (el: T) => (ref.current = el)] as const;
}

function Friend(
  id: string,
  markFriendAsInactive: (id: string) => void,
  startingShame: number,
) {
  const [$, set$] = autoRef<HTMLDivElement>();
  const [progressRef, setProgressRef] = autoRef<HTMLMeterElement>();
  const [progressLabel, setProgressLabel] = autoRef<HTMLProgressElement>();

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

  const topics: string[] = [];
  // const topicCount = 2;
  // for (let i = 0; i < topicCount; i++) {
  // const rand = Math.random();
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

  function willAccept(ev: DragEvent) {
    if (!ev.dataTransfer) return false;
    if (!recoverable) return false;
    const topic = ev.dataTransfer.getData('text/plain');
    if (topics.find((t) => t === topic)) return true;
    return false;
  }

  function onDragOver(ev: DragEvent) {
    if (willAccept(ev)) {
      ev.preventDefault();
    }
  }

  function onDrop(ev: DragEvent) {
    ev.preventDefault();
    const data = ev.dataTransfer?.getData('text/plain');
    if (!data) return;
    console.log(`Dropped ${data}`);

    const gs = getGameState();
    if (gs.dragTarget) {
      gs.dragTarget.remove();
      gs.dragTarget = null;
    }

    // reset styles
    const target = ev.currentTarget as HTMLElement;
    target.style.backgroundColor = 'transparent';

    if (progressRef.current) progressRef.current.value -= data.length * 10;

    updateLabel();
  }

  function onDragEnter(ev: DragEvent) {
    if (!willAccept(ev)) return;

    console.log('drag enter');
    const target = ev.currentTarget as HTMLElement;
    target.style.backgroundColor = 'blue';
  }

  function onDragLeave(ev: DragEvent) {
    console.log('drag leave');
    const target = ev.currentTarget as HTMLElement;
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
        <div>Friend A</div>
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
          ${topics.map((topic) => stract`<li>${topic}</li>`)}
        </ul>
      </div>
    </div>
  `;
}

function SharablesList() {
  register1HzTick(() => {
    const rand = Math.random();
    if (rand > 0.5) {
      // spawn new sharable
      list.current?.appendChild(Sharable());
    }
  });

  const list: Ref<HTMLUListElement> = { current: null };

  return stract`
    <div>
      <ul ref=${(el: HTMLUListElement) => (list.current = el)}>
      </ul>
    </div>
  `;
}

const icons = [
  // large circle
  '\u25EF',
  // triangle,
  '\u25B3',
  // square
  '\u25FB',
  // cross
  '\u2715',
];

function generateTopic(length: number) {
  let topic = '';
  for (let i = 0; i < length; i++) {
    const rand = Math.random();
    const icon = icons[Math.floor(rand * icons.length)];
    topic = `${topic}${icon}`.split('').sort().join('');
  }
  return topic;
}

function Sharable() {
  // const rand = Math.random();
  const topic = generateTopic(Math.random() > 0.85 ? 4 : 2);

  function onDragStart(ev: DragEvent) {
    if (!ev.dataTransfer) return;
    ev.dataTransfer.dropEffect = 'move';
    ev.dataTransfer.setData('text/plain', topic);
    const target = ev.target as HTMLElement;
    getGameState().dragTarget = target;
  }

  // Do styling here, as this event seems to fire after the clone has been made.
  function onDrag(ev: DragEvent) {
    const target = ev.target as HTMLElement;
    target.style.outline = '1px solid red';
  }

  function onDragEnd(ev: DragEvent) {
    const target = ev.target as HTMLElement;
    target.style.outline = '';
  }

  let age = 0;
  const maxAge = 10;
  const unregHz = register1HzTick(() => {
    if (!$.current) return;
    age += 1;

    // TODO: lerp
    $.current.style.opacity = `${1 - age / maxAge}`;

    if (age > maxAge) {
      $.current.remove();
      unregHz();
    }
  });

  const [$, set$] = autoRef<HTMLDataListElement>();

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

function fmtMsAsHHSSMM(ms: number) {
  const totalSeconds = ms / 1000;
  // const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const milliseconds = ms % 1000;
  return `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds : `0${seconds}`}.${milliseconds > 99 ? milliseconds : milliseconds > 9 ? `0${milliseconds}` : `00${milliseconds}`}`;
}

function AnxietyTicker(
  getTotalActiveFriendsCount: () => number,
  markAnxietyNotSustainedRef: Ref<() => { ms: number; points: number }>,
) {
  const [$time, set$time] = autoRef<HTMLDivElement>();
  const [$points, set$points] = autoRef<HTMLDivElement>();
  const [$label, set$label] = autoRef<HTMLDivElement>();

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
    assertDefinedFatal($label.current);
    sustained = false;
    $label.current.textContent = 'Anxiety Not Sustained';
    // $points.current.textContent = '';
    return { ms, points };
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

function AnxietyNotSustained(
  animationCompleted: () => void,
  totalMs: number,
  totalPoints: number,
) {
  const [$, set$] = autoRef<HTMLElement>();

  const parts = `Anxiety Not Sustained`.split(' ');
  const sub = [
    `Anxiety lasted ${fmtMsAsHHSSMM(totalMs)}, ${totalPoints} points`,
  ];

  const off = register1HzTick(() => {
    if (parts.length === 0) {
      const part = sub.shift();
      if (!part) return;

      $.current?.appendChild(
        stract`<span style="font-size: 1rem;"><span style="background-color: black;">${part}</span></span>`,
      );

      if (sub.length === 0) {
        off();
        animationCompleted();
        return;
      }
    }
    const part = parts.shift();
    if (!part) return;
    $.current?.appendChild(
      // double span so that the first is flex'ed, and the second is sized just
      // to the text
      stract`<span><span style="background-color: black;">${part}</span></span>`,
    );
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
  const ctrl1Hz = new BrowserIntervalCtrl();
  ctrl1Hz.set(() => {
    run1HzTicks();
  }, 1000);

  const ctrl10Hz = new BrowserIntervalCtrl();
  ctrl10Hz.set(() => {
    run10HzTicks();
  }, 100);

  const ctrl100Hz = new BrowserIntervalCtrl();
  ctrl100Hz.set(() => {
    run100HzTicks();
  }, 10);

  function stopTickers() {
    ctrl1Hz.clear();
    ctrl10Hz.clear();
    ctrl100Hz.clear();
  }

  window.addEventListener('keyup', (ev) => {
    if (ev.key === 'Escape') {
      stopTickers();
      console.log('halt');
    }
  });

  const friends = [
    { id: 'a', startingShame: 50 },
    { id: 'b', startingShame: 40 },
    { id: 'c', startingShame: 75 },
  ];

  function getTotalActiveFriendsCount() {
    return friends.length;
  }

  function animationCompleted() {
    stopTickers();
  }

  const markAnxietyNotSustainedRef: Ref<() => { ms: number; points: number }> =
    { current: null };

  function markFriendAsInactive(id: string) {
    const idx = friends.findIndex((f) => f.id === id);
    if (idx === -1) return;
    friends.splice(idx, 1);

    if (friends.length === 0) {
      // end state
      const { ms, points } = markAnxietyNotSustainedRef.current?.() ?? {
        ms: 0,
        points: 0,
      };
      $.current?.appendChild(
        AnxietyNotSustained(animationCompleted, ms, points),
      );
    }
  }

  const [$, set$] = autoRef<HTMLDivElement>();

  return stract`
    <div ref=${set$} style="position: relative;">
      ${AnxietyTicker(getTotalActiveFriendsCount, markAnxietyNotSustainedRef)}
      ${friends.map((f) => Friend(f.id, markFriendAsInactive, f.startingShame))}
      ${SharablesList()}
    </div>
  `;
}

const gameState = {
  dragTarget: null as HTMLElement | null,
};

function getGameState() {
  return gameState;
}

document.querySelector('body')?.appendChild(Root());

// TODO: remove friend topics so there is just one or two per friend
