import React, { useState, useEffect, useRef } from "react";
import "./Carousel.css";

const Carousel = ({
  children,
  autoPlay = false,
  autoPlayInterval = 3000,
  showDots = true,
  showArrows = true,
  slidesToShow = 1,
  slidesToScroll = 1,
  infinite = true,
  responsive = [],
  className = "",
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShowCurrent, setSlidesToShowCurrent] = useState(slidesToShow);
  const carouselRef = useRef(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = React.Children.toArray(children);
  const totalSlides = slides.length;

  // Handle responsive breakpoints
  useEffect(() => {
    const updateSlidesToShow = () => {
      const width = window.innerWidth;
      let newSlidesToShow = slidesToShow;

      responsive.forEach((breakpoint) => {
        if (width <= breakpoint.breakpoint) {
          newSlidesToShow = breakpoint.settings.slidesToShow;
        }
      });

      setSlidesToShowCurrent(newSlidesToShow);
    };

    updateSlidesToShow();
    window.addEventListener("resize", updateSlidesToShow);
    return () => window.removeEventListener("resize", updateSlidesToShow);
  }, [slidesToShow, responsive]);

  // Auto play functionality
  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        if (infinite) {
          return (prev + slidesToScroll) % totalSlides;
        } else {
          return Math.min(
            prev + slidesToScroll,
            totalSlides - slidesToShowCurrent
          );
        }
      });
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [
    autoPlay,
    autoPlayInterval,
    infinite,
    slidesToScroll,
    totalSlides,
    slidesToShowCurrent,
  ]);

  const nextSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) => (prev + slidesToScroll) % totalSlides);
    } else {
      setCurrentSlide((prev) =>
        Math.min(prev + slidesToScroll, totalSlides - slidesToShowCurrent)
      );
    }
  };

  const prevSlide = () => {
    if (infinite) {
      setCurrentSlide((prev) =>
        prev === 0 ? totalSlides - slidesToScroll : prev - slidesToScroll
      );
    } else {
      setCurrentSlide((prev) => Math.max(prev - slidesToScroll, 0));
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        setCurrentSlide((prev) => {
          if (infinite) {
            return prev === 0
              ? totalSlides - slidesToScroll
              : prev - slidesToScroll;
          } else {
            return Math.max(prev - slidesToScroll, 0);
          }
        });
      } else if (e.key === "ArrowRight") {
        setCurrentSlide((prev) => {
          if (infinite) {
            return (prev + slidesToScroll) % totalSlides;
          } else {
            return Math.min(
              prev + slidesToScroll,
              totalSlides - slidesToShowCurrent
            );
          }
        });
      }
    };

    const carouselElement = carouselRef.current;
    if (carouselElement) {
      carouselElement.addEventListener("keydown", handleKeyDown);
      return () =>
        carouselElement.removeEventListener("keydown", handleKeyDown);
    }
  }, [infinite, slidesToScroll, totalSlides, slidesToShowCurrent]);

  const translateX = -(currentSlide * (100 / slidesToShowCurrent));

  return (
    <div
      className={`carousel ${className}`}
      ref={carouselRef}
      tabIndex="0"
      role="region"
      aria-label="Carousel"
    >
      <div className="carousel-container">
        {showArrows && (
          <button
            className="carousel-arrow carousel-arrow-prev"
            onClick={prevSlide}
            disabled={!infinite && currentSlide === 0}
            aria-label="Previous slide"
          >
            &#8249;
          </button>
        )}

        <div
          className="carousel-wrapper"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="carousel-track"
            style={{
              transform: `translateX(${translateX}%)`,
              width: `${(totalSlides / slidesToShowCurrent) * 100}%`,
            }}
          >
            {slides.map((slide, index) => (
              <div
                key={index}
                className="carousel-slide"
                style={{ width: `${100 / totalSlides}%` }}
              >
                {slide}
              </div>
            ))}
          </div>
        </div>

        {showArrows && (
          <button
            className="carousel-arrow carousel-arrow-next"
            onClick={nextSlide}
            disabled={
              !infinite && currentSlide >= totalSlides - slidesToShowCurrent
            }
            aria-label="Next slide"
          >
            &#8250;
          </button>
        )}
      </div>

      {showDots && totalSlides > slidesToShowCurrent && (
        <div className="carousel-dots">
          {Array.from({
            length: Math.ceil(totalSlides / slidesToShowCurrent),
          }).map((_, index) => (
            <button
              key={index}
              className={`carousel-dot ${
                Math.floor(currentSlide / slidesToShowCurrent) === index
                  ? "active"
                  : ""
              }`}
              onClick={() => goToSlide(index * slidesToShowCurrent)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Carousel;
