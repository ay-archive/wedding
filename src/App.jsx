import { useEffect, useRef, useState } from "react";
import "./App.css";

const BASE_URL = import.meta.env.BASE_URL;

function withBaseUrl(path) {
  return `${BASE_URL}${path}`;
}

const WEDDING_DATE = {
  year: 2026,
  month: 11,
  day: 1,
};

const WEDDING_DATE_LABEL = "2026. 11. 01 SUN PM 13:00";
const KOREA_TIME_ZONE = "Asia/Seoul";
const CALENDAR_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

const INTRODUCTION = [
  "안녕하세요, 신랑 김경환, 신부 이아영 입니다.",
  "평생을 함께할 사람을 만나, 결혼을 앞두게 되었습니다.",
  "처음 만난 날부터 지금까지, 참 많은 시간과 순간을 함께해 왔습니다. 별것 아닌 이야기로 한참을 웃고, 하루의 크고 작은 일들을 가장 먼저 나누며, 어느새 평범한 일상을 가장 행복하게 만들어주는 사람이 되었습니다. 기쁜 날에는 누구보다 함께 기뻐해 주고, 힘든 날에는 묵묵히 곁을 지켜주며 그렇게 서로의 일상이 되어갔습니다.",
  "함께하는 시간이 쌓일수록 특별한 순간만큼이나 평범한 하루를 함께하는 행복이 크다는 것을 알게 되었습니다. 문득 좋은 일이 생겼을 때 가장 먼저 떠오르는 사람, 어려운 순간에 가장 기대고 싶은 사람, 그리고 앞으로의 계획을 이야기할 때 자연스럽게 함께 그려지는 사람이 서로라는 사실도 알게 되었습니다.",
  "그렇게 저희는 이제 연인을 넘어 가족이 되어, 앞으로의 삶을 함께 걸어가고자 합니다.",
  "결혼을 준비하며 돌아보니 지금의 저희가 있기까지 참 많은 분들의 사랑과 응원이 있었다는 것을 다시 한번 느끼게 되었습니다. 늘 따뜻한 마음으로 지켜봐 주시고 응원해 주신 모든 분들께 진심으로 감사드립니다.",
  "앞으로도 서로를 존중하고 아끼며, 좋은 날에는 기쁨을 나누고 어려운 날에는 힘이 되어주는 부부가 되겠습니다. 완벽하기보다는 서로에게 따뜻한 사람이 되고, 특별한 날들뿐 아니라 평범한 일상 속에서도 행복을 만들어 가며 살아가겠습니다.",
  "저희의 새로운 시작을 따뜻한 마음으로 축복해 주신다면 더없는 기쁨이 되겠습니다.",
  "감사합니다.",
];

const ACCOUNT_GROUPS = [
  {
    side: "신랑측",
    accounts: [
      { bank: "은행", number: "1002 538 883045", holder: "김다솔" },
      { bank: "은행", number: "1002 538 883045", holder: "김다솔" },
    ],
  },
  {
    side: "신부측",
    accounts: [
      { bank: "하나은행", number: "448 910214 36807", holder: "이갑재" },
      { bank: "신한은행", number: "110 355 932959", holder: "이아영" },
    ],
  },
];

const LOCATION = {
  name: "서울대학교 연구공원 웨딩홀",
  address: "서울 관악구 관악로 1 연구공원 웨딩홀",
  lat: 37.4631, // 위도 (정확한 핀 위치로 조정 필요)
  lng: 126.954, // 경도
  naverMapUrl:
    "https://map.naver.com/p/search/%EC%84%9C%EC%9A%B8%EB%8C%80%20%EC%97%B0%EA%B5%AC%EA%B3%B5%EC%9B%90%20%EC%9B%A8%EB%94%A9%ED%99%80/place/13321741",
  kakaoMapUrl:
    "https://map.kakao.com/?q=" +
    encodeURIComponent("서울 관악구 관악로 1 연구공원 웨딩홀"),
};

const FAMILY_INTRO = [
  {
    role: "신랑",
    parents: "김경문 · 주산수",
    relation: "의 아들",
    name: "김다솔",
  },
  {
    role: "신부",
    parents: "이갑재 · 주정자",
    relation: "의 딸",
    name: "이아영",
  },
];

const GALLERY_COUNT = 11; 

const PHOTO_SLOTS = Array.from({ length: GALLERY_COUNT }, (_, i) => {
  const num = String(i + 1).padStart(2, "0"); // 1 → "01"
  return {
    src: withBaseUrl(`images/gallery/photo-${num}.jpg`),
    alt: `두 사람의 추억 사진 ${i + 1}`,
    label: `갤러리 사진 ${num}`,
    hint: `public/images/gallery/photo-${num}.jpg`,
  };
});


const HERO_PHOTO = {
  src: withBaseUrl("images/hero/main.jpg"),
  alt: "대표 커플 사진",
  label: "대표 사진",
  hint: "public/images/hero/main.jpg",
};

function getDatePartsInTimeZone(timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const values = {};

  parts.forEach((part) => {
    if (part.type !== "literal") {
      values[part.type] = part.value;
    }
  });

  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
  };
}

function getCountdown() {
  const today = getDatePartsInTimeZone(KOREA_TIME_ZONE);
  const weddingUtc = Date.UTC(
    WEDDING_DATE.year,
    WEDDING_DATE.month - 1,
    WEDDING_DATE.day,
  );
  const todayUtc = Date.UTC(today.year, today.month - 1, today.day);
  const dayDiff = Math.round((weddingUtc - todayUtc) / 86400000);

  if (dayDiff > 0) {
    return {
      label: `D-${dayDiff}`,
      description: `예식일까지 ${dayDiff}일 남았습니다.`,
    };
  }

  if (dayDiff === 0) {
    return {
      label: "D-Day",
      description: "오늘이 바로 결혼식 날입니다.",
    };
  }

  return {
    label: `D+${Math.abs(dayDiff)}`,
    description: `예식 후 ${Math.abs(dayDiff)}일이 지났습니다.`,
  };
}

function getCalendarDays(year, month) {
  const firstDay = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const lastDate = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const days = [];

  for (let index = 0; index < firstDay; index += 1) {
    days.push(null);
  }

  for (let day = 1; day <= lastDate; day += 1) {
    days.push(day);
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.append(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  document.body.removeChild(textArea);

  if (!copied) {
    throw new Error("Copy failed");
  }
}

function PhotoSlot({ src, alt, label, hint, className = "" }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <div className={`photo-slot photo-slot--placeholder ${className}`}>
        <span className="photo-slot__tag">{label}</span>
        <strong>{hint.split("/").at(-1)}</strong>
        <p>{hint}</p>
      </div>
    );
  }

  return (
    <img
      className={`photo-slot ${className}`}
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      loading="lazy"
    />
  );
}

function ChunkedText({ as: Tag = "p", className = "", text }) {
  const chunks = text.split(" ");

  return (
    <Tag className={className}>
      {chunks.map((chunk, index) => (
        <span className="text-chunk" key={`${chunk}-${index}`}>
          {chunk}
        </span>
      ))}
    </Tag>
  );
}

function App() {
  const [countdown, setCountdown] = useState(() => getCountdown());
  const [copiedAccount, setCopiedAccount] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  // 라이트박스: 보여줄 사진 목록 + 현재 인덱스 (null이면 닫힘)
  const [lightbox, setLightbox] = useState({ photos: [], index: null });
  const calendarDays = getCalendarDays(WEDDING_DATE.year, WEDDING_DATE.month);
  const touchStartX = useRef(null);

  const isLightboxOpen = lightbox.index !== null;
  const currentPhoto = isLightboxOpen ? lightbox.photos[lightbox.index] : null;
  const hasMultiple = lightbox.photos.length > 1;

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCountdown(getCountdown());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.18,
        rootMargin: "0px 0px -12% 0px",
      },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!copiedAccount) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setCopiedAccount("");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [copiedAccount]);

  useEffect(() => {
    if (!toastMessage) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setToastMessage("");
    }, 1800);

    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  // 라이트박스 키보드: Esc 닫기 / ← → 이동
  useEffect(() => {
    if (!isLightboxOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // 카카오 지도 렌더링
  useEffect(() => {
    const { kakao } = window;
    if (!kakao || !kakao.maps) return;

    kakao.maps.load(() => {
      const container = document.getElementById("kakao-map");
      if (!container) return;

      const center = new kakao.maps.LatLng(LOCATION.lat, LOCATION.lng);
      const map = new kakao.maps.Map(container, { center, level: 3 });

      // 핀(마커) 표시
      new kakao.maps.Marker({ position: center, map });

      // 확대/축소 컨트롤
      map.addControl(
        new kakao.maps.ZoomControl(),
        kakao.maps.ControlPosition.RIGHT,
      );
    });
  }, []);

  // 라이트박스 열기 (사진 목록과 시작 인덱스 지정)
  const openLightbox = (photos, index) => {
    setLightbox({ photos, index });
  };

  const closeLightbox = () => {
    setLightbox((prev) => ({ ...prev, index: null }));
  };

  const showPrev = () => {
    setLightbox((prev) => {
      if (prev.index === null) return prev;
      const len = prev.photos.length;
      return { ...prev, index: (prev.index - 1 + len) % len };
    });
  };

  const showNext = () => {
    setLightbox((prev) => {
      if (prev.index === null) return prev;
      const len = prev.photos.length;
      return { ...prev, index: (prev.index + 1) % len };
    });
  };

  // 모바일 스와이프
  const handleTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const diff = event.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) showPrev();
    if (diff < -50) showNext();
    touchStartX.current = null;
  };

  const handleCopyAccount = async (account) => {
    const text = account.number.replace(/\s+/g, "");

    try {
      await copyToClipboard(text);
      setCopiedAccount(account.number);
      setToastMessage(`${account.bank} 계좌번호가 복사되었습니다.`);
    } catch (error) {
      setCopiedAccount(`${account.number}-error`);
      setToastMessage("복사에 실패했어요. 다시 시도해 주세요.");
    }
  };

  const handleCopyAddress = async (address) => {
    try {
      await copyToClipboard(address);
      setToastMessage("주소가 복사되었습니다.");
    } catch (error) {
      setToastMessage("복사에 실패했어요. 다시 시도해 주세요.");
    }
  };

  return (
    <main className="page">
      {toastMessage ? (
        <div className="toast" role="status" aria-live="polite">
          {toastMessage}
        </div>
      ) : null}

      <div className="page__glow page__glow--top" aria-hidden="true" />
      <div className="page__glow page__glow--bottom" aria-hidden="true" />

      <section className="hero" data-reveal>
        <div className="hero__copy">
          <p className="eyebrow">We Are Getting Married</p>
          <h1>
            <span className="hero__names">김경환 | 이아영</span>
          </h1>
          <p className="hero__date">
            <br />
            {WEDDING_DATE_LABEL}
            <br />
            서울대학교 연구공원 웨딩홀
          </p>
          <p className="hero__lead">
            저희, 결혼합니다! ღ'ᴗ'ღ <br />
            가을이 머무는 11월의 첫날, 함께 걸어갈 길을 약속하려 합니다. <br />
          </p>
        </div>

        <button
          type="button"
          className="hero__visual hero__visual-button"
          data-reveal
          style={{ "--reveal-delay": "0.18s" }}
          onClick={() => openLightbox([HERO_PHOTO], 0)}
          aria-label="대표 사진 크게 보기"
        >
          <PhotoSlot
            className="hero__photo"
            src={HERO_PHOTO.src}
            alt={HERO_PHOTO.alt}
            label={HERO_PHOTO.label}
            hint={HERO_PHOTO.hint}
          />
        </button>
      </section>

      <section className="section" data-reveal>
        <div className="section-heading">
          <p className="section-heading__eyebrow">Main Letter</p>
          <h2>인사말</h2>
        </div>

        <article className="story-card">
          {INTRODUCTION.map((paragraph) => (
            <ChunkedText key={paragraph} text={paragraph} />
          ))}
          <p className="story-card__signature">경환, 아영 드림</p>
        </article>
      </section>

      <section className="section section--highlight">
        <div className="countdown-card" data-reveal>
          <p className="section-heading__eyebrow">Countdown</p>
          <strong className="countdown-card__value">{countdown.label}</strong>
          <ChunkedText
            className="countdown-card__description"
            text={countdown.description}
          />
          <div className="calendar-card" aria-label="2026년 11월 달력">
            <div className="calendar-card__header">
              <span className="calendar-card__label">Calendar</span>
              <strong>2026년 11월</strong>
            </div>
            <div className="calendar-card__grid calendar-card__grid--weekdays">
              {CALENDAR_WEEKDAYS.map((weekday) => (
                <span className="calendar-card__weekday" key={weekday}>
                  {weekday}
                </span>
              ))}
            </div>
            <div className="calendar-card__grid">
              {calendarDays.map((day, index) => {
                const isWeddingDay = day === WEDDING_DATE.day;

                return (
                  <span
                    className={`calendar-card__day${
                      day ? "" : " calendar-card__day--empty"
                    }${isWeddingDay ? " calendar-card__day--highlight" : ""}`}
                    key={`${day ?? "empty"}-${index}`}
                  >
                    {day ?? ""}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="section section--family">
        <div className="family-card" data-reveal>
          <p className="section-heading__eyebrow">Bride &amp; Groom</p>
          <div className="family-card__grid">
            {FAMILY_INTRO.map((person, index) => (
              <article
                className="family-card__person"
                key={person.role}
                data-reveal
                style={{ "--reveal-delay": `${0.1 * index}s` }}
              >
                <p className="family-card__parents-line">
                  <span className="family-card__parents">{person.parents}</span>
                  <span className="family-card__relation">
                    {person.relation}
                  </span>
                </p>
                <br />
                <p className="family-card__name-line">
                  <span className="family-card__role">{person.role}</span>
                  <strong className="family-card__name">{person.name}</strong>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 새 갤러리 (GALLERY 문구 추가) ===== */}
      <section className="section section--gallery">
        <div className="section-heading" data-reveal>
          <p className="section-heading__eyebrow">Gallery</p>
          {/* <h2>갤러리</h2>  */}
        </div>

        <div className="gallery-grid">
          {PHOTO_SLOTS.map((photo, index) => (
            <button
              type="button"
              className="gallery-card"
              key={photo.src}
              data-reveal
              style={{ "--reveal-delay": `${0.1 * index}s` }}
              onClick={() => openLightbox(PHOTO_SLOTS, index)}
            >
              <PhotoSlot {...photo} />
            </button>
          ))}
        </div>
      </section>

      {/* ===== 오시는 길 (Location) ===== */}
      <section className="section section--location">
        <div className="section-heading" data-reveal>
          <p className="section-heading__eyebrow">Location</p>
          <h2>오시는 길</h2>
        </div>

        <article className="location-card" data-reveal>
          {/* 카카오 실시간 지도 */}
          <div id="kakao-map" className="location-card__map" />

          <p className="location-card__name">{LOCATION.name}</p>
          <p className="location-card__address">{LOCATION.address}</p>

          <div className="location-card__buttons">
            <button
              type="button"
              className="copy-button location-card__btn"
              onClick={() => handleCopyAddress(LOCATION.address)}
            >
              주소 복사
            </button>
            <a
              className="copy-button location-card__btn"
              href={LOCATION.naverMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              네이버 지도
            </a>
            <a
              className="copy-button location-card__btn"
              href={LOCATION.kakaoMapUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              카카오맵
            </a>
          </div>
        </article>

        {/* 오시는 길 안내 박스 (인사말과 동일한 흰 박스) */}
        <article className="story-card location-guide" data-reveal>
          <p>
            <strong>대중교통</strong>
            <br />
            낙성대역에서 02 마을버스를 탑승하여 '가족생활동' 정류장에서 하차해
            주시기 바랍니다. (약 10분 소요)
            <br />
            하차 후 횡단보도를 건너, 버스 진행 방향 기준 왼편의 길로 들어와
            직진해 주세요.
            <br />
            <br />
            <strong>자가용</strong>
            <br />
            웨딩홀 주차장을 이용하실 수 있으며, 주차 공간은 넉넉하게 마련되어
            있습니다.
            <br />
            주차 후 지하 1층(B1)을 통해 웨딩홀(1층)로 바로 이동하실 수 있습니다.
          </p>
        </article>
      </section>

      <section className="section">
        <div className="section-heading" data-reveal>
          <p className="section-heading__eyebrow">Heartfelt Support</p>
          <h2>마음을 전하실 곳</h2>
        </div>

        <div className="account-grid">
          {ACCOUNT_GROUPS.map((group, groupIndex) => (
            <article
              className="account-card"
              key={group.side}
              data-reveal
              style={{ "--reveal-delay": `${0.12 * groupIndex}s` }}
            >
              <p className="account-card__side">{group.side}</p>

              <div className="account-card__list">
                {group.accounts.map((account, index) => {
                  const isCopied = copiedAccount === account.number;
                  const copyFailed = copiedAccount === `${account.number}-error`;

                  return (
                    <div className="account-item" key={`${account.number}-${index}`}>
                      <p className="account-card__line">
                        <span className="account-card__bank">{account.bank}</span>
                        <span className="account-card__number">{account.number}</span>
                        <span className="account-card__holder">{account.holder}</span>
                      </p>
                      <button
                        type="button"
                        className="copy-button"
                        onClick={() => handleCopyAccount(account)}
                      >
                        계좌번호 복사
                      </button>
                      <p className="account-card__feedback" aria-live="polite">
                        {isCopied && `${account.bank} 계좌 정보가 복사되었습니다.`}
                        {copyFailed && "복사에 실패했어요. 다시 시도해 주세요."}
                      </p>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      </section>

      {isLightboxOpen ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={currentPhoto.alt}
          onClick={closeLightbox}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            className="lightbox__close"
            aria-label="사진 닫기"
            onClick={closeLightbox}
          >
            ×
          </button>

          {hasMultiple ? (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--prev"
              aria-label="이전 사진"
              onClick={(event) => {
                event.stopPropagation();
                showPrev();
              }}
            >
              <span className="lightbox__nav-icon">‹</span>
            </button>
          ) : null}

          <div
            className="lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="lightbox__image"
              src={currentPhoto.src}
              alt={currentPhoto.alt}
            />
          </div>

          {hasMultiple ? (
            <button
              type="button"
              className="lightbox__nav lightbox__nav--next"
              aria-label="다음 사진"
              onClick={(event) => {
                event.stopPropagation();
                showNext();
              }}
            >
              <span className="lightbox__nav-icon">›</span>
            </button>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}

export default App;
