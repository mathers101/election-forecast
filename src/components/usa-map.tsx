import { useEffect, useRef, useState } from "react";
import { TransformComponent, TransformWrapper, useControls, type ReactZoomPanPinchContentRef } from "react-zoom-pan-pinch";
import USAState, { type StateContest } from "./usa-state";
import { stateData, type State } from "../data/static-state-data";
import type { StateProbabilities, StateProbability } from "@/data/state-probabilities";

// Long enough for the zoom-out to be visible, short of the full 500ms transform.
const ZOOM_OUT_BEFORE_NEXT_MS = 200;
const POPOVER_AFTER_ZOOM_MS = 100;
const PAN_CLICK_THRESHOLD_PX = 8;

export type CustomizeConfig = {
  fill?: string;
  clickHandler?: () => void;
};

const dataStates = stateData;

const eventPoint = (event: MouseEvent | TouchEvent) => {
  if ("touches" in event) {
    const touch = event.touches[0] ?? event.changedTouches[0];
    return touch ? { x: touch.clientX, y: touch.clientY } : null;
  }
  return { x: event.clientX, y: event.clientY };
};

function MapZoomControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls();

  return (
    <div className="absolute right-2 top-2 z-10 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-sm sm:right-3 sm:top-3">
      <button type="button" className="flex size-10 items-center justify-center text-xl font-medium text-gray-700 hover:bg-gray-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-purple-700" onClick={() => void zoomIn()} aria-label="Zoom in">+</button>
      <button type="button" className="flex size-10 items-center justify-center border-l border-gray-200 text-xl font-medium text-gray-700 hover:bg-gray-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-purple-700" onClick={() => void zoomOut()} aria-label="Zoom out">−</button>
      <button type="button" className="border-l border-gray-200 px-3 text-xs font-medium text-gray-600 hover:bg-gray-100 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-purple-700" onClick={() => void resetTransform()} aria-label="Reset map zoom">Reset</button>
    </div>
  );
}

interface USAMapProps {
  onClick: (stateAbbreviation: State) => void;
  width?: number;
  height?: number;
  title?: string;
  defaultFill?: string;
  customize?: Partial<Record<State, CustomizeConfig>>;
  stateProbabilities: StateProbabilities;
  setStateProbability: (state: State, prob: StateProbability | null) => void;
  contests: Partial<Record<State, StateContest>>;
}

const USAMap = ({
  onClick,
  width = 959,
  height = 593,
  title = "Blank US states map",
  defaultFill = "#D3D3D3",
  customize = {},
  stateProbabilities,
  setStateProbability,
  contests,
}: USAMapProps) => {
  const [openState, setOpenState] = useState<State | null>(null);
  const [mapZoomed, setMapZoomed] = useState(false);
  const groupRef = useRef<SVGGElement>(null);
  const transformRef = useRef<ReactZoomPanPinchContentRef>(null);
  const draggedMapRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const selectedRef = useRef<State | null>(null);
  const intendedRef = useRef<State | null>(null);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const fillStateColor = (state: State) => {
    return customize[state]?.fill || defaultFill;
  };

  const schedule = (delay: number, action: () => void) => {
    const id = window.setTimeout(action, delay);
    timersRef.current.push(id);
  };

  const zoomTo = (state: State) => {
    selectedRef.current = state;
    const statePath = groupRef.current?.querySelector(`[data-name="${state}"]`);
    if (statePath) {
      void transformRef.current?.zoomToElement(statePath as unknown as HTMLElement, {
        scale: 2,
        animationTime: 500,
      });
    }
    schedule(POPOVER_AFTER_ZOOM_MS, () => {
      if (intendedRef.current === state) setOpenState(state);
    });
  };

  const handleStateClick = (state: State) => {
    clearTimers();
    onClick(state);
    const previous = selectedRef.current;
    intendedRef.current = state;

    if (previous && previous !== state) {
      selectedRef.current = null;
      setOpenState(null);
      void transformRef.current?.resetTransform(ZOOM_OUT_BEFORE_NEXT_MS);
      schedule(ZOOM_OUT_BEFORE_NEXT_MS, () => {
        if (intendedRef.current === state) zoomTo(state);
      });
      return;
    }

    zoomTo(state);
  };

  const dismiss = (state?: State) => {
    if (state && intendedRef.current && intendedRef.current !== state) return;
    clearTimers();
    intendedRef.current = null;
    selectedRef.current = null;
    setOpenState(null);
    void transformRef.current?.resetTransform(500);
  };

  const setProbabilityByState = (state: State) => (prob: StateProbability | null) => {
    setStateProbability(state, prob);
  };

  return (
    <div className="relative w-full max-w-375 overflow-hidden" style={{ aspectRatio: `${width} / ${height}` }}>
      <TransformWrapper
        ref={transformRef}
        initialScale={1}
        minScale={1}
        maxScale={4}
        limitToBounds
        panning={{ disabled: !mapZoomed }}
        pinch={{ allowPanning: true }}
        wheel={{ activationKeys: ["Control", "Meta"] }}
        onTransform={(_, state) => { setMapZoomed(state.scale > 1); }}
        onPanningStart={(_, event) => {
          panStartRef.current = eventPoint(event);
          draggedMapRef.current = false;
        }}
        onPanning={(_, event) => {
          const start = panStartRef.current;
          const current = eventPoint(event);
          if (start && current && Math.hypot(current.x - start.x, current.y - start.y) > PAN_CLICK_THRESHOLD_PX) {
            draggedMapRef.current = true;
          }
        }}
        onPanningStop={() => {
          window.setTimeout(() => {
            draggedMapRef.current = false;
            panStartRef.current = null;
          }, 0);
        }}
      >
        {() => (
          <>
            <MapZoomControls />
            <TransformComponent
              wrapperStyle={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
              contentStyle={{ width: "100%", height: "100%" }}
              wrapperProps={{
                onClickCapture: (event) => {
                  if (draggedMapRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    draggedMapRef.current = false;
                  }
                },
              }}
            >
              <svg className="block h-full w-full" xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 959 593" onClick={() => dismiss()}>
                <title>{title}</title>
                <g
                  className="outlines"
                  ref={groupRef}
                  onClick={(e) => e.stopPropagation()} // prevent zoom reset when clicking a state
                >
                  {Object.entries(dataStates).map(([stateKey, data]) => (
                    <USAState
                      key={stateKey}
                      stateName={data.name ?? ""}
                      dimensions={data.dimensions ?? ""}
                      state={stateKey as State}
                      fill={fillStateColor(stateKey as State)}
                      isOpen={openState === stateKey}
                      onSelectState={() => handleStateClick(stateKey as State)}
                      onUnselectState={() => dismiss(stateKey as State)}
                      onClearSelection={() => dismiss()}
                      probability={stateProbabilities[stateKey as State]}
                      setProbability={setProbabilityByState(stateKey as State)}
                      contest={contests[stateKey as State]}
                    />
                  ))}
                </g>
              </svg>
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default USAMap;
