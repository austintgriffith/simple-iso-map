"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { NextPage } from "next";

// Define types
type TileType = string;
type GridType = TileType[][];

const Home: NextPage = () => {
  // === Adjustable Constants ===
  const TILE_SIZE = 256; // Base tile size
  const TILE_SCALE = 1; // Zoom level

  // === Fine-Tuning Between Tiles ===
  const TILE_HORIZONTAL_ADJUST = -15; // Base horizontal spacing
  const TILE_VERTICAL_ADJUST = 12; // Base vertical spacing

  // === Progressive Drift Correction ===
  const HORIZONTAL_DRIFT_CORRECTION = 5; // Corrects horizontal drift
  const VERTICAL_DRIFT_CORRECTION = 1; // (Optional) Corrects vertical drift if needed

  // === Map Position Offset ===
  const [mapOffset, setMapOffset] = useState({ x: -300, y: -800 }); // Replace static OFFSET_X/Y with state

  // Computed tile size
  const TILE_WIDTH = TILE_SIZE * TILE_SCALE;
  const TILE_HEIGHT = TILE_WIDTH / 2;

  // Define possible tiles
  const tiles: TileType[] = ["dirt.png", "forest.png", "forest2.png", "forest3.png", "forest4.png"];
  const [grid, setGrid] = useState<GridType>([]);

  // Add these new state variables near the top with other state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Add touch-specific state
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 });

  // Generate a grid of all forest tiles
  const generateInitialGrid = (): GridType => {
    const newGrid: GridType = [];
    for (let i = 0; i < 10; i++) {
      const row: TileType[] = [];
      for (let j = 0; j < 10; j++) {
        // Randomly select one of the forest tiles (indices 1-4 in the tiles array)
        const randomForestIndex = Math.floor(Math.random() * 4) + 1;
        row.push(tiles[randomForestIndex]);
      }
      newGrid.push(row);
    }
    return newGrid;
  };

  // Add these new helper functions
  const screenToIso = (screenX: number, screenY: number) => {
    const rect = document.querySelector(".grid-container")?.getBoundingClientRect();
    if (!rect) return null;

    const relativeX = screenX - rect.left - mapOffset.x;
    const relativeY = screenY - rect.top - mapOffset.y;

    // Convert screen coordinates to isometric coordinates
    const tileWidthHalf = TILE_WIDTH / 2 + TILE_HORIZONTAL_ADJUST;
    const tileHeightHalf = TILE_HEIGHT / 2 + TILE_VERTICAL_ADJUST;

    // Add small offsets to adjust the calculation
    const x = (relativeX / tileWidthHalf + relativeY / tileHeightHalf) / 2 - 1; // Subtract 1 from x instead
    const y = (relativeY / tileHeightHalf - relativeX / tileWidthHalf) / 2; // Keep y as is

    return {
      row: Math.floor(y),
      col: Math.floor(x),
    };
  };

  // Replace handleTileClick with this new click handler
  const handleGridClick = (e: React.MouseEvent) => {
    if (hasMoved) return; // Skip if this was a drag operation

    const coords = screenToIso(e.clientX, e.clientY);
    if (!coords) return;

    const { row, col } = coords;

    // Check if the calculated position is within grid bounds
    if (row >= 0 && row < grid.length && col >= 0 && col < grid[0].length) {
      const newGrid = [...grid];
      newGrid[row][col] = "dirt.png";
      setGrid(newGrid);
    }
  };

  // Add these new handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setHasMoved(false); // Reset the move tracker
    setDragStart({ x: e.clientX - mapOffset.x, y: e.clientY - mapOffset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    setHasMoved(true); // User has moved while dragging
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setMapOffset({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Add these touch event handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling
    setIsDragging(true);
    setHasMoved(false);
    setTouchStart({
      x: e.touches[0].clientX - mapOffset.x,
      y: e.touches[0].clientY - mapOffset.y,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent default scrolling
    if (!isDragging) return;

    setHasMoved(true);
    const newX = e.touches[0].clientX - touchStart.x;
    const newY = e.touches[0].clientY - touchStart.y;
    setMapOffset({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Generate grid on component mount
  useEffect(() => {
    const initialGrid = generateInitialGrid();
    setGrid(initialGrid);
  }, []);

  return (
    <>
      <div className="main-container">
        <div
          className="grid-container"
          onClick={handleGridClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {grid.map((row, rowIndex) =>
            row.map((tile, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className="tile"
                style={{
                  left: `${
                    (colIndex - rowIndex) * (TILE_WIDTH / 2 + TILE_HORIZONTAL_ADJUST) +
                    colIndex * HORIZONTAL_DRIFT_CORRECTION +
                    mapOffset.x
                  }px`,
                  top: `${
                    (colIndex + rowIndex) * (TILE_HEIGHT / 2 + TILE_VERTICAL_ADJUST) +
                    rowIndex * VERTICAL_DRIFT_CORRECTION +
                    mapOffset.y
                  }px`,
                }}
              >
                <Image
                  src={`/tiles/${tile}`}
                  alt={tile}
                  width={TILE_WIDTH}
                  height={TILE_HEIGHT}
                  className="tile-image"
                  draggable={false}
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
          touch-action: none; /* Disable browser handling of touch gestures */
        }

        /* Grid container */
        .grid-container {
          position: relative;
          user-select: none; /* Prevent text selection while dragging */
          touch-action: none; /* Disable browser handling of touch gestures */
        }

        /* Tile positioning */
        .tile {
          position: absolute;
          width: ${TILE_WIDTH}px;
          height: ${TILE_HEIGHT}px;
          cursor: pointer;
        }

        .tile-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }
      `}</style>
    </>
  );
};

export default Home;
