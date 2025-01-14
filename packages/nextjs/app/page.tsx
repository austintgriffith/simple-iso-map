"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";

// Define types
type TileType = "dirt.png" | "grass.png" | "grass2.png" | "forest.png";
type TileData = {
  type: TileType;
  rizz: number;
};
type GridType = TileData[][];

const Home: NextPage = () => {
  // === Adjustable Constants ===
  const TILE_SIZE = 256; // Base tile size
  const TILE_SCALE = 1; // Zoom level

  // === Fine-Tuning Between Tiles ===
  const TILE_HORIZONTAL_ADJUST = -15; // Base horizontal spacing
  const TILE_VERTICAL_ADJUST = 12; // Base vertical spacing

  // === Progressive Drift Correction ===
  const HORIZONTAL_DRIFT_CORRECTION = 7; // Corrects horizontal drift
  const VERTICAL_DRIFT_CORRECTION = 2; // (Optional) Corrects vertical drift if needed

  // === Map Position Offset ===
  const OFFSET_X = -100; // Shifts the entire map left/right
  const OFFSET_Y = -800; // Shifts the entire map up/down

  // Computed tile size
  const TILE_WIDTH = TILE_SIZE * TILE_SCALE;
  const TILE_HEIGHT = TILE_WIDTH / 2;

  // Define possible tiles
  const tiles: TileType[] = ["dirt.png", "grass.png", "grass2.png", "forest.png"];
  const [grid, setGrid] = useState<GridType>([]);

  // Generate a 10x10 grid of random tiles with rizz
  const generateRandomGrid = (): GridType => {
    const newGrid: GridType = [];

    for (let i = 0; i < 10; i++) {
      const row: TileData[] = [];
      for (let j = 0; j < 10; j++) {
        const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
        row.push({
          type: randomTile,
          rizz: 0,
        });
      }
      newGrid.push(row);
    }

    return newGrid;
  };

  // Update these wave constants
  const WAVE_SPEED = 0.4; // Reduced further for smoother movement
  const WAVE_AMPLITUDE = 4;
  const WAVE_FREQUENCY = 0.2;
  const DIAGONAL_FACTOR = 0.3;

  // Add time state for the animation
  const [time, setTime] = useState(0);

  // Update the wave animation effect with less frequent updates
  useEffect(() => {
    const intervalId = setInterval(() => {
      setTime(prevTime => prevTime + 1);

      setGrid(currentGrid => {
        return currentGrid.map((row, i) =>
          row.map((tile, j) => {
            const waveOffset =
              Math.sin(time * WAVE_SPEED + (i + j) * WAVE_FREQUENCY + (i - j) * DIAGONAL_FACTOR) * WAVE_AMPLITUDE;

            return {
              ...tile,
              rizz: waveOffset,
            };
          }),
        );
      });
    }, 100); // Increased to 100ms - less frequent updates

    return () => clearInterval(intervalId);
  }, [time]);

  // Generate initial grid
  useEffect(() => {
    const randomGrid = generateRandomGrid();
    setGrid(randomGrid);
  }, []);

  return (
    <>
      <div className="main-container">
        <div className="grid-container">
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="tile"
                style={{
                  left: `${
                    (colIndex - rowIndex) * (TILE_WIDTH / 2 + TILE_HORIZONTAL_ADJUST) +
                    colIndex * HORIZONTAL_DRIFT_CORRECTION +
                    OFFSET_X
                  }px`,
                  top: `${
                    (colIndex + rowIndex) * (TILE_HEIGHT / 2 + TILE_VERTICAL_ADJUST) +
                    rowIndex * VERTICAL_DRIFT_CORRECTION +
                    OFFSET_Y +
                    tile.rizz * 5
                  }px`,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // Smooth easing function
                }}
              >
                <Image
                  src={`/tiles/${tile.type}`}
                  alt={tile.type}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  className="tile-image"
                />
              </div>
            )),
          )}
        </div>
      </div>

      <style jsx>{`
        .main-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }

        .grid-container {
          position: relative;
          will-change: transform; /* Optimize for animations */
        }

        .tile {
          position: absolute;
          width: ${TILE_WIDTH}px;
          height: ${TILE_HEIGHT}px;
          will-change: transform; /* Optimize for animations */
        }

        .tile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      `}</style>
    </>
  );
};

export default Home;
