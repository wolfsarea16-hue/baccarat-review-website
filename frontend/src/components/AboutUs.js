import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import './AboutUs.css';

const AboutUs = () => {
    const navigate = useNavigate();
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = ['/about2.png', '/about3.png', '/about4.png'];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % images.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentImageIndex, images.length]);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const [currentLoversIndex, setCurrentLoversIndex] = useState(0);
    const loversImages = [
        ['/about11.png', '/about12.png'],
        ['/about13.png', '/about14.png'],
        ['/about15.png', '/about16.png']
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentLoversIndex((prev) => (prev + 1) % loversImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentLoversIndex, loversImages.length]);

    const nextLovers = () => {
        setCurrentLoversIndex((prev) => (prev + 1) % loversImages.length);
    };

    const prevLovers = () => {
        setCurrentLoversIndex((prev) => (prev - 1 + loversImages.length) % loversImages.length);
    };

    const [currentConquestIndex, setCurrentConquestIndex] = useState(0);
    const conquestImages = [
        ['/about5.png', '/about6.png'],
        ['/about7.png', '/about8.png'],
        ['/about9.png', '/about10.png']
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentConquestIndex((prev) => (prev + 1) % conquestImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentConquestIndex, conquestImages.length]);

    const nextConquest = () => {
        setCurrentConquestIndex((prev) => (prev + 1) % conquestImages.length);
    };

    const prevConquest = () => {
        setCurrentConquestIndex((prev) => (prev - 1 + conquestImages.length) % conquestImages.length);
    };

    const [currentArtistIndex, setCurrentArtistIndex] = useState(0);
    const artistImages = ['/about17.png', '/about18.png', '/about19.png'];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentArtistIndex((prev) => (prev + 1) % artistImages.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [currentArtistIndex, artistImages.length]);

    const nextArtist = () => {
        setCurrentArtistIndex((prev) => (prev + 1) % artistImages.length);
    };

    const prevArtist = () => {
        setCurrentArtistIndex((prev) => (prev - 1 + artistImages.length) % artistImages.length);
    };

    return (
        <div className="page-with-sidebar about-page">
            <Sidebar />
            <div className="main-content">
                <div className="about-container">
                    {/* Section 1: History */}
                    <div className="about-header">
                        <span className="about-subtitle">WORLD OF BACCARAT</span>
                        <h1 className="about-title">THE HISTORY</h1>
                    </div>

                    <div className="about-content-split">
                        <div className="about-text-column">
                            <div className="about-logo-wrapper">
                                <img src="/bcc-small.png" alt="Baccarat Gem" className="about-gem-logo" />
                            </div>
                            <h2 className="about-section-title">THE PASSION OF A GROUP OF ARTISANS</h2>
                            <p className="about-description">
                                In 1764, in eastern France, a group of daring craftsmen set out to transform the four elements of nature – earth, air, fire and water – into glass of absolute quality. In 1816, they perfected their well-kept secret formula to obtain a crystal of unparalleled purity.
                            </p>
                        </div>
                        <div className="about-image-column">
                            <img src="/about1.png" alt="Baccarat History" className="about-main-image" />
                        </div>
                    </div>

                    {/* Section 2: World Fairs Carousel */}
                    <div className="about-carousel-section">
                        <h2 className="about-section-header">THE WORLD FAIRS, THE ASCENSION</h2>

                        <div className="carousel-container">
                            <button className="carousel-btn prev" onClick={prevImage}>&#10094;</button>
                            <div className="carousel-image-wrapper">
                                <img
                                    key={currentImageIndex}
                                    src={images[currentImageIndex]}
                                    alt={`World Fair ${currentImageIndex + 1}`}
                                    className="carousel-image"
                                />
                            </div>
                            <button className="carousel-btn next" onClick={nextImage}>&#10095;</button>
                        </div>

                        <div className="carousel-description">
                            <p>
                                In 1855, for the first World Fair in Paris, Baccarat unveiled its unique craftsmanship to the world. Exhibited to the delight of fascinated visitors, Baccarat’s dazzling creations have made the exceptional a reality.
                            </p>
                            <p>
                                Years later, by crafting a temple in homage to the god Mercury, and later an epic crystal ship, Baccarat continued to elicit surprise, and garner numerous medals at each major national and international Exhibition.
                            </p>
                        </div>
                    </div>

                    {/* Section 3: Spirit of Conquest */}
                    <div className="about-conquest-section">
                        <h2 className="about-section-header">THE SPIRIT OF CONQUEST</h2>

                        <div className="conquest-content-wrapper">
                            <div className="conquest-images-container">
                                {conquestImages[currentConquestIndex].map((img, index) => (
                                    <img
                                        key={`${currentConquestIndex}-${index}`}
                                        src={img}
                                        alt={`Conquest ${index + 1}`}
                                        className="conquest-image"
                                    />
                                ))}
                            </div>

                            <div className="conquest-info-side">
                                <img src="/bcc-small.png" alt="Baccarat Gem" className="about-gem-logo" />
                                <h3 className="conquest-side-title">BACCARAT HAS CAST ITS LIGHT AROUND THE WORLD</h3>
                            </div>
                        </div>

                        <div className="conquest-controls">
                            <button className="carousel-btn prev dark-arrows" onClick={prevConquest}>&#10094;</button>
                            <button className="carousel-btn next dark-arrows" onClick={nextConquest}>&#10095;</button>
                        </div>

                        <div className="conquest-description">
                            <p>
                                From the custom furniture made for the Maharajahs of India to the majestic "Tsar’s” candelabra created for Nicholas II, the impressive collection of lighting fixtures for the Dolmabahçe Palace in Istanbul, the pieces commissioned by Napoleon III for his apartments in the Louvre and Tuileries, the refined creations for the Japanese imperial court, to the Juvisy service that has adorned the ceremonial tables of the Elysée Palace since 1899, Baccarat has cast its light around the world.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: The Baccarat Lovers */}
                    <div className="about-conquest-section">
                        <h2 className="about-section-header">THE BACCARAT LOVERS</h2>

                        <div className="conquest-content-wrapper">
                            <div className="conquest-images-container">
                                {loversImages[currentLoversIndex].map((img, index) => (
                                    <img
                                        key={`${currentLoversIndex}-${index}`}
                                        src={img}
                                        alt={`Lover ${index + 1}`}
                                        className="conquest-image"
                                    />
                                ))}
                            </div>

                            <div className="conquest-info-side">
                                <img src="/bcc-small.png" alt="Baccarat Gem" className="about-gem-logo" />
                                <h3 className="conquest-side-title">ENCHANTING FESTIVITIES AND ELEGANT RECEPTIONS, BACCARAT HAS WON OVER THE ELITE</h3>
                            </div>
                        </div>

                        <div className="conquest-controls">
                            <button className="carousel-btn prev dark-arrows" onClick={prevLovers}>&#10094;</button>
                            <button className="carousel-btn next dark-arrows" onClick={nextLovers}>&#10095;</button>
                        </div>

                        <div className="conquest-description">
                            <p>
                                Its name alone is an invitation to wonderment. Enchanting festivities and elegant receptions, Baccarat has won over the elite.
                            </p>
                            <p>
                                From Josephine Baker to the Princess of Monaco, Marilyn Monroe to Karl Lagerfeld, and Kris Jenner to Gigi Hadid, Baccarat has transcended fashion, seducing the lovers of life and opinion leaders of every generation. At the forefront of style, the House draws inspiration from its heritage to shape the tastes of tomorrow.
                            </p>
                        </div>
                    </div>

                    {/* Section 5: Artists and Temptation */}
                    <div className="about-carousel-section">
                        <h2 className="about-section-header">ARTISTS AND THE TEMPTATION OF BACCARAT</h2>

                        <div className="carousel-container">
                            <button className="carousel-btn prev" onClick={prevArtist}>&#10094;</button>
                            <div className="carousel-image-wrapper">
                                <img
                                    key={currentArtistIndex}
                                    src={artistImages[currentArtistIndex]}
                                    alt={`Artist ${currentArtistIndex + 1}`}
                                    className="carousel-image"
                                />
                            </div>
                            <button className="carousel-btn next" onClick={nextArtist}>&#10095;</button>
                        </div>

                        <div className="carousel-description">
                            <p>
                                Salvador Dali, Ettore Sottsass, Philippe Starck, Jaime Hayon, Marcel Wanders, and Virgil Abloh – the world’s iconic artists and designers have also succumbed to the temptation of Baccarat. Through unprecedented collaborations, each has imparted a unique artistic vision, constantly pushing the limits of technique, often defying the laws of matter. The absolute complicity between the artists and craftsmen has resulted in original, soulful creations rich in imagination.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="about-footer">
                        <p className="copyright">Copyright ©2026 Baccarat. All rights reserved</p>
                        <div className="footer-links">
                            <button onClick={() => navigate('/home')}>Home</button>
                            <button onClick={() => navigate('/about')}>About Us</button>
                            <button onClick={() => navigate('/terms')}>T&C</button>
                            <button onClick={() => navigate('/faq')}>FAQ</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;
