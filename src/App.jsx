import { useEffect, useState } from "react";
import "./App.css";

const BASE_URL = import.meta.env.BASE_URL;

function withBaseUrl(path) {
  return `${BASE_URL}${path}`;
}

const WEDDING_DATE = {
  year: 2026,
  month: 5,
  day: 16,
};

const WEDDING_DATE_LABEL = "2026년 5월 16일";
const KOREA_TIME_ZONE = "Asia/Seoul";

const INTRODUCTION = [
  "드디어 저희, 결혼합니다! 지구 반대편 여기저기에서 꽤 오래 서로를 지켜온 저희, 드디어 한 걸음 더 나아가기로 했습니다.",
  "이번 한국 일정이 길지 않다 보니, 정말 번개같이(?) 식을 준비하게 되었어요. 해외에서 조율하다 보니 굉장히 아담한 공간을 선택하게 되어, 가족과 아주 가까운 분들만 모시고 소박한 파티를 열기로 하였습니다.",
  "마음 같아서는 모든 분을 모시고 한바탕 떠들썩하게 즐기고 싶지만, 너그러운 마음으로 이해해 주세요, 이번에는 멀리서 보내주시는 응원만으로도 큰 힘과 사랑이 될 것 같습니다.",
  "한국에 있는 동안 한 분 한 분 다 뵙지 못하더라도, 마음만은 늘 가까이에 두겠습니다. 뉴욕에 오시면 현지인 맛집과 야경 코스까지 저희가 책임지고 모실테니 그때 꼭 못다 한 이야기와 축하를 나눠요.",
  "감사합니다.",
];

const ACCOUNTS = [
  {
    side: "신부측",
    bank: "하나은행",
    number: "448 910214 36807",
    holder: "이갑재",
  },
  {
    side: "신랑측",
    bank: "우리은행",
    number: "1002 538 883045",
    holder: "김다솔",
  },
];

const PHOTO_SLOTS = [
  {
    src: withBaseUrl("images/gallery/photo-01.jpg"),
    alt: "두 사람의 추억 사진 1",
    label: "갤러리 사진 01",
    hint: "public/images/gallery/photo-01.jpg",
  },
  {
    src: withBaseUrl("images/gallery/photo-02.jpg"),
    alt: "두 사람의 추억 사진 2",
    label: "갤러리 사진 02",
    hint: "public/images/gallery/photo-02.jpg",
  },
  {
    src: withBaseUrl("images/gallery/photo-03.jpg"),
    alt: "두 사람의 추억 사진 3",
    label: "갤러리 사진 03",
    hint: "public/images/gallery/photo-03.jpg",
  },
  {
    src: withBaseUrl("images/gallery/photo-04.jpg"),
    alt: "두 사람의 추억 사진 4",
    label: "갤러리 사진 04",
    hint: "public/images/gallery/photo-04.jpg",
  },
];

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
      description: `한국 시간 기준으로 예식일까지 ${dayDiff}일 남았습니다.`,
    };
  }

  if (dayDiff === 0) {
    return {
      label: "D-Day",
      description: "한국 시간 기준으로 오늘이 바로 결혼식 날입니다.",
    };
  }

  return {
    label: `D+${Math.abs(dayDiff)}`,
    description: `한국 시간 기준으로 예식 후 ${Math.abs(dayDiff)}일이 지났습니다.`,
  };
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

function App() {
  const [countdown, setCountdown] = useState(() => getCountdown());
  const [copiedAccount, setCopiedAccount] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);

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

  useEffect(() => {
    if (!selectedPhoto) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhoto]);

  const handleCopyAccount = async (account) => {
    const text = `${account.bank} ${account.number} (${account.holder})`;

    try {
      await copyToClipboard(text);
      setCopiedAccount(account.side);
      setToastMessage(`${account.bank} 계좌번호가 복사되었습니다.`);
    } catch (error) {
      setCopiedAccount(`${account.side}-error`);
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
          <p className="eyebrow">Mobile Wedding Invitation</p>
          <div className="hero__ornament" aria-hidden="true" />
          <h1>
            <span className="hero__names">이나영 그리고 김다솔</span>
          </h1>
          <p className="hero__headline">결혼합니다!</p>
          <p className="hero__date">{WEDDING_DATE_LABEL}</p>
          <p className="hero__lead">
            소박하지만 오래 기억될 하루를 준비하고 있습니다.
          </p>

          <div className="hero__badge-group">
            <div className="badge">
              <span className="badge__label">D-Day</span>
              <strong>{countdown.label}</strong>
            </div>
          </div>
        </div>

        <div
          className="hero__visual"
          data-reveal
          style={{ "--reveal-delay": "0.18s" }}
        >
          <PhotoSlot
            className="hero__photo"
            src={withBaseUrl("images/hero/main.jpg")}
            alt="대표 커플 사진"
            label="대표 사진"
            hint="public/images/hero/main.jpg"
          />
        </div>
      </section>

      <section className="section" data-reveal>
        <div className="section-heading">
          <p className="section-heading__eyebrow">Main Letter</p>
          <h2>인사말</h2>
        </div>

        <article className="story-card">
          {INTRODUCTION.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </article>
      </section>

      <section className="section section--highlight">
        <div className="countdown-card" data-reveal>
          <p className="section-heading__eyebrow">Countdown</p>
          <strong className="countdown-card__value">{countdown.label}</strong>
          <p className="countdown-card__description">{countdown.description}</p>
        </div>
      </section>

      <section className="section section--gallery">
        <div className="gallery-grid">
          {PHOTO_SLOTS.map((photo, index) => (
            <button
              type="button"
              className="gallery-card"
              key={photo.src}
              data-reveal
              style={{ "--reveal-delay": `${0.1 * index}s` }}
              onClick={() => setSelectedPhoto(photo)}
            >
              <PhotoSlot {...photo} />
            </button>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="section-heading" data-reveal>
          <p className="section-heading__eyebrow">Heartfelt Support</p>
          <h2>마음을 전하실 곳</h2>
        </div>

        <div className="account-grid">
          {ACCOUNTS.map((account, index) => {
            const isCopied = copiedAccount === account.side;
            const copyFailed = copiedAccount === `${account.side}-error`;

            return (
              <article
                className="account-card"
                key={account.side}
                data-reveal
                style={{ "--reveal-delay": `${0.12 * index}s` }}
              >
                <p className="account-card__side">{account.side}</p>
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
              </article>
            );
          })}
        </div>
      </section>

      {selectedPhoto ? (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedPhoto.alt}
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="lightbox__close"
            aria-label="사진 닫기"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <div
            className="lightbox__content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              className="lightbox__image"
              src={selectedPhoto.src}
              alt={selectedPhoto.alt}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

export default App;
