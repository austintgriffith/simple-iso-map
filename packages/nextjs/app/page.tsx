"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";

// Define types
type TileType = "dirt.png" | "grass.png" | "grass2.png" | "forest.png";
type GridType = TileType[][];

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

  // Generate a 10x10 grid of random tiles
  const generateRandomGrid = (): GridType => {
    const newGrid: GridType = [];

    for (let i = 0; i < 10; i++) {
      const row: TileType[] = [];
      for (let j = 0; j < 10; j++) {
        const randomTile = tiles[Math.floor(Math.random() * tiles.length)];
        row.push(randomTile);
      }
      newGrid.push(row);
    }

    return newGrid;
  };

  // Generate grid on component mount
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
                    OFFSET_Y
                  }px`,
                }}
              >
                <Image
                  src={`/tiles/${tile}`}
                  alt={tile}
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
        /* Full-screen centered container */
        .main-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          width: 100vw;
          overflow: hidden;
          position: relative;
        }

        /* Grid container */
        .grid-container {
          position: relative;
        }

        /* Tile positioning */
        .tile {
          position: absolute;
          width: ${TILE_WIDTH}px;
          height: ${TILE_HEIGHT}px;
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
