import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TexSchemePage.css';
// import { API_BASE_URL } from './config';
const API_BASE_URL = 'http://localhost:3001';

const PROMPT_WITH_FURNITURE = `You are a professional architectural draftsman, and people's lives depend on your work.
Redraw this 2D apartment floor plan into a high-quality technical drawing, accurately preserving
all proportions, layout, and room dimensions. Do NOT change the layout or positions of walls,
doors, windows, plumbing, or any items already drawn in the source image.
INPUT NORMALIZATION — STRAIGHTEN & RECTIFY (REQUIRED):
• If the source photo/scan is rotated, skewed, or shot at an angle, FIRST correct it:
– Rotate to the nearest cardinal angle (0°, 90°, 180°, 270°) so any text reads upright.
– Deskew so horizontal/vertical walls are exactly horizontal/vertical (orthogonal grid).
– Apply perspective rectification to rebuild a clean orthographic, top-down plan (no
foreshortening).
• Preserve relative proportions while rectifying; do not invent or move openings/walls.
• Remove background, shadows and paper edges; redraw as a clean vector-like plan.
STRUCTURAL ELEMENTS:
External load-bearing walls: thickness 4–5px, black fill
Internal load-bearing walls: thickness 3px, black fill
Partitions: thickness 2px, black fill
Doors: show opening arc (1px dashed line) + shortened door leaf; respect swing
clearances
Windows: double frame 2px + diagonal hatching of glass at 45°
Balconies/loggias: detect from context (protrusions, glazing, rails)
VISUAL STYLE:
Background: pure white (#FFFFFF)
Lines and fills: pure black (#000000)
No shadows, gradients, or gray tones
Canvas size: 1200×1200px, JPG quality 95%
FURNITURE POLICY — PRESERVE + COMPLETE (MANDATORY &
DIVERSITY):
1) Preserve ALL existing furniture/sanitary fixtures exactly as in the source image.
2) THEN add missing furniture so each room is functional and visually complete.
3) MANDATORY: Every enclosed room (including hallways, corridors, walk-in closets,
storage/pantry, utility, WC, bathrooms) must contain at least the minimum set listed below for its
type.
4) DIVERSITY: Each furnished room must include at least TWO different furniture
categories (e.g., seating + storage; sleeping + storage; work + storage).
5) QUANTITY: Prefer more (but sensible) furniture. After placing the minimum set, add
optional items until any of these limits would be violated:
• main walkway width < 80 cm, or
• door/window swing/clearances blocked, or
• furniture footprint would exceed ~35% of the room area (soft cap).
6) SCALE/STYLE: Use simple 2D icons with realistic proportions; align to walls;
Furniture line thickness: 1px.
ROOM-BY -ROOM MINIMUMS (add OPTIONAL items if space allows):
• Entry / Hallway (MIN 2): wardrobe/closet (D≈60 cm) + bench/console/shoe cabinet.
OPTIONAL: mirror panel, coat rack.
• Corridor (MIN 1): narrow console/shelf (D≤30 cm).
OPTIONAL: wall-mounted storage, mirror panel.
• Living Room (MIN 3): sofa (W≈180–240 cm) + coffee table + media unit/TV stand.
OPTIONAL: armchair, bookshelf, sideboard, desk+chair.
• Kitchen/Dining (MIN 4): base cabinets (D≈60 cm) incl. sink + cooktop + fridge +
dining table (120–160×75–90 cm) with 2–6 chairs.
OPTIONAL: wall cabinets, island or bar with stools.
• Bedroom — Double (MIN 4): double bed (140–160×200 cm) + 2 nightstands +
wardrobe (D≈60 cm).
OPTIONAL: dresser/commode, desk+chair.
• Bedroom — Single/Kids (MIN 3): single bed (90×200 cm) + wardrobe + desk+chair.
OPTIONAL: bookcase, nightstand.
• Home Office (MIN 3): desk + chair + bookshelf/cabinet.
OPTIONAL: sofa/sofa-bed, filing cabinet.
• Bathroom (combined) (MIN 3): toilet + washbasin + shower (80×80 cm) OR bathtub
(170×70 cm).
OPTIONAL: tall cabinet/shelves, washing machine (≈60×60 cm), towel rail.
• WC (separate) (MIN 2): toilet + small washbasin.
OPTIONAL: shelf/cabinet.
• Utility/Laundry (MIN 2): washer (≈60×60 cm) + storage shelf/cabinet.
OPTIONAL: dryer, ironing board.
• Storage/Pantry/Closet (MIN 1): shelving units along one wall.
• Balcony/Loggia (MIN 1 if feasible): one compact item (folding chair or planter). If
adding ANY item would block access or glazing, leave empty.
PLACEMENT & CLEARANCES:
• Keep main walkways ≥80 cm where possible.
• Do not block door swings, windows, radiators, or plumbing fixtures.
• Typical clearances: in front of wardrobes ≥75 cm; around double bed ≥60 cm on
accessible sides; in front of toilet ≥60 cm with side clearance ≥15 cm.
• If the minimum set cannot fit, use compact alternatives (e.g., shower instead of bathtub,
narrower wardrobe). If absolutely impossible, place at least ONE smallest appropriate item for
that room type.
TEXT AND LABELS:
Only room areas in format "12.3 m²"
Font: Arial, 12 px, black; centered within rooms with furniture arranged to keep the label
legible
COMPOSITION:
Plan centered in image
Margins ≥50 px from canvas edges
No borders, titles, or dimension lines
`;

const PROMPT_NO_FURNITURE = `You are a professional architectural draftsman, and people's lives depend on your work. Redraw this 2D apartment floor plan into a high-quality technical drawing, accurately preserving all proportions, layout, and room dimensions.

INPUT NORMALIZATION — STRAIGHTEN & RECTIFY (REQUIRED):
• If the source photo/scan is rotated, skewed, or shot at an angle, FIRST correct it:
  – Rotate to the nearest cardinal angle (0°, 90°, 180°, 270°) so any text reads upright.
  – Deskew so horizontal/vertical walls are exactly horizontal/vertical (orthogonal grid).
  – Apply perspective rectification to rebuild a clean orthographic, top-down plan (no foreshortening).
• Preserve relative proportions while rectifying; do not invent or move openings/walls.
• Remove background, shadows and paper edges; redraw as a clean vector-like plan.

CANVAS FIT — UNIFORM SCALE & MARGINS (STRICT):
• After rectification, CENTER the entire plan as a single unit.
• UNIFORMLY SCALE (isotropic) the plan to be as large as possible while keeping a HARD MINIMUM MARGIN of ≥50px from the nearest geometry (any line, hatch, or text) to each image edge.
• If necessary, slightly increase or decrease overall scale to satisfy the ≥50px margin on ALL sides and keep all text fully inside rooms.
• Do NOT crop any part of the plan. Do NOT stretch non-uniformly. Maintain aspect ratio.
• HARD RULE: No line, hatch, or text may touch or cross the image boundary.

STRUCTURAL ELEMENTS:

External load-bearing walls: thickness 4-5px, black fill
Internal load-bearing walls: thickness 3px, black fill
Partitions: thickness 2px, black fill
Doors: show opening arc (1px dashed line) + shortened door leaf
Windows: double frame 2px + diagonal hatching of glass at 45°
Balconies/loggias: determine from context (protruding elements, glazing, railings)

VISUAL STYLE:

Background: pure white (#FFFFFF)
Lines and fills: pure black (#000000)
No shadows, gradients, or gray tones
Size: 1200x1200px, JPG quality 95%

FURNITURE AND EQUIPMENT:

DRAW ONLY the furniture and sanitary fixtures that are explicitly visible in the provided source image. DO NOT add, infer, or complete any furniture that is not clearly shown.
Do NOT add beds, sofas, tables, chairs, kitchen units, wardrobes, or any other items unless they are explicitly present in the source image.
If uncertain whether an item exists, leave the room empty.
Preserve all existing furniture as simple geometric shapes
Furniture proportions must correspond to real dimensions
Furniture line thickness: 1px

TEXT AND LABELS:

Only room areas in format "12.3 m²"
Font: Arial, size 12px, black color
Place in center of rooms

COMPOSITION:

Plan centered in image
Margins from edges minimum 50px
No borders, titles, or dimension lines
`;

const TexSchemePage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedFurnitureOption, setSelectedFurnitureOption] = useState<'withFurniture' | 'noFurniture' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!selectedImage || !selectedFurnitureOption) return;

    setIsGenerating(true);
    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      formData.append('prompt', selectedFurnitureOption === 'withFurniture' ? PROMPT_WITH_FURNITURE : PROMPT_NO_FURNITURE);

      const response = await fetch(`${API_BASE_URL}/api/generate-floor-plan`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const planBlob = await response.blob();
        const planUrl = URL.createObjectURL(planBlob);
        setGeneratedPlan(planUrl);
      } else {
        const errorData = await response.json();
        console.error('Ошибка генерации:', errorData.error);
        alert(`Ошибка: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Ошибка:', error);
      alert('Произошла ошибка при генерации');
    } finally {
      setIsGenerating(false);
    }
  };

  const resetApp = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setGeneratedPlan(null);
    setSelectedFurnitureOption(null);
  };

  const goHome = () => {
    navigate('/');
  };

  return (
    <div className="texscheme-page">
      {/* Современный анимированный фон */}
      <div className="background-animation">
        <div className="animated-grid"></div>
        <div className="floating-particles">
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </div>
      </div>

      {/* Основной контент */}
      <div className={`texscheme-content ${isLoaded ? 'loaded' : ''}`}>
        {/* Навигация */}
        <nav className="main-navbar">
          <div className="nav-content">
            <button className="back-button" onClick={goHome}>
              <span className="back-icon">←</span>
              <span>На главную</span>
            </button>
            <div className="nav-title">
              <div className="title-icon">📐</div>
              <div className="title-text">
                <span className="title-main">AI Генератор</span>
                <span className="title-sub">Технических Планов</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Основной контент */}
        <div className="main-content">
          <div className="page-header">
            <div className="header-badge">
              <span className="badge-icon">✨</span>
              <span className="badge-text">AI-Powered Generation</span>
            </div>
            
            <h1 className="page-title">
              <span className="title-highlight">AI Генерация</span>
              <span className="title-normal">технических планов</span>
            </h1>
            
            <p className="page-description">
              Загрузите фотографию технического плана помещения и получите профессиональную 
              архитектурную схему с точными пропорциями и деталями за считанные секунды
            </p>
          </div>

          {/* Секция загрузки */}
          <div className="upload-section">
            <div className="upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                id="image-upload"
                className="file-input"
              />
              <label htmlFor="image-upload" className="upload-label">
                {imagePreview ? (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Предпросмотр" className="preview-image" />
                    <div className="preview-overlay">
                      <div className="overlay-content">
                        <div className="overlay-icon">🔄</div>
                        <span className="overlay-text">Нажмите для изменения</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <h3 className="upload-title">Загрузите план помещения</h3>
                    <p className="upload-description">
                      Перетащите изображение сюда или нажмите для выбора файла
                    </p>
                    <div className="upload-features">
                      <span className="feature-tag">JPG, PNG, WEBP</span>
                      <span className="feature-tag">До 10MB</span>
                      <span className="feature-tag">Высокое качество</span>
                    </div>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Кнопки выбора опции мебели */}
          {!generatedPlan && (
            <div className="furniture-options">
              <button
                className={`option-btn ${selectedFurnitureOption === 'withFurniture' ? 'selected' : ''}`}
                onClick={() => setSelectedFurnitureOption('withFurniture')}
              >
                С мебелью
              </button>
              <button
                className={`option-btn ${selectedFurnitureOption === 'noFurniture' ? 'selected' : ''}`}
                onClick={() => setSelectedFurnitureOption('noFurniture')}
              >
                Без мебели
              </button>
            </div>
          )}

          {/* Кнопка генерации */}
          <div className="generate-section">
            <button 
              className={`generate-btn ${isGenerating ? 'generating' : ''}`}
              onClick={handleGenerate}
              disabled={!selectedImage || isGenerating || !selectedFurnitureOption}
            >
              <div className="btn-content">
                <span className="btn-icon">
                  {isGenerating ? '🎨' : '⚡'}
                </span>
                <span className="btn-text">
                  {isGenerating ? 'Генерация...' : 'Сгенерировать план'}
                </span>
              </div>
              {isGenerating && (
                <div className="loading-animation">
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                  <div className="loading-dot"></div>
                </div>
              )}
              <div className="btn-glow"></div>
              <div className="btn-ripple"></div>
            </button>
          </div>

          {/* Результат */}
          {generatedPlan && (
            <div className="result-section">
              <div className="result-header">
                <div className="result-title">
                  <div className="title-icon">✅</div>
                  <div className="title-text">
                    <h2>Результат генерации</h2>
                    <p>Ваш технический план готов к скачиванию</p>
                  </div>
                </div>
                <div className="result-actions">
                  <button 
                    onClick={resetApp}
                    className="action-btn"
                  >
                    <span className="btn-icon">🔄</span>
                    <span>Новый план</span>
                  </button>
                </div>
              </div>

              <div className="result-content">
                <div className="plan-info">
                  <div className="info-card">
                    <div className="info-icon">🎯</div>
                    <div className="info-content">
                      <h4>Точность</h4>
                      <p>Сохранены все пропорции и размеры</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">🎨</div>
                    <div className="info-content">
                      <h4>Качество</h4>
                      <p>Профессиональный архитектурный стандарт</p>
                    </div>
                  </div>
                  <div className="info-card">
                    <div className="info-icon">⚡</div>
                    <div className="info-content">
                      <h4>Скорость</h4>
                      <p>Результат за несколько секунд</p>
                    </div>
                  </div>
                </div>

                <div className="plan-container">
                  <div className="plan-wrapper">
                    <img 
                      src={generatedPlan} 
                      alt="Сгенерированный технический план" 
                      className="generated-plan"
                    />
                    <div className="plan-overlay">
                      <a 
                        href={generatedPlan} 
                        download="technical-plan.png"
                        className="download-btn"
                      >
                        <span className="btn-icon">💾</span>
                        <span>Скачать план</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TexSchemePage;
