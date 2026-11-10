/**
 * A dung beetle in a headstand, front legs on the ground and back legs
 * reaching up over its ball, drawn in the 404 scene's coordinates (viewBox 0 0 500
 * 210, ground at y 190.5, ball centred at 300,129). The body is drawn level
 * and tilted into place; the legs are jointed (femur, toothed tibia, tarsus),
 * with the far ones lighter for depth. Generated once, so it's static paths.
 * Colours come from currentColor and the page background.
 */
export default function DungBeetle() {
  return (
    <g>
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "190.9px 175.2px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M190.9 175.2 L189.0 182.5" strokeWidth="4.2" />
        <path d="M189.0 182.5 L197.0 189.5" strokeWidth="3" />
        <path d="M191.2 184.4 l-1.0 3.4" strokeWidth="1.3" />
        <path d="M193.4 186.4 l-1.0 3.4" strokeWidth="1.3" />
        <path d="M195.7 188.3 l-1.0 3.4" strokeWidth="1.3" />
        <path d="M197.0 189.5 L203.0 190.5" strokeWidth="1.4" />
      </g>
      <g
        className="nf-leg-a stroke-current"
        style={{ transformOrigin: "212.1px 160.7px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M212.1 160.7 L222.0 170.5" strokeWidth="4.2" />
        <path d="M222.0 170.5 L230.0 182.5" strokeWidth="3" />
        <path d="M224.2 173.8 l-1.8 3.0" strokeWidth="1.3" />
        <path d="M226.4 177.2 l-1.8 3.0" strokeWidth="1.3" />
        <path d="M228.7 180.5 l-1.8 3.0" strokeWidth="1.3" />
        <path d="M230.0 182.5 L237.0 188.5" strokeWidth="1.4" />
      </g>
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "234.6px 135.0px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M234.6 135.0 L246.0 98.0" strokeWidth="4.2" />
        <path d="M246.0 98.0 L262.0 67.0" strokeWidth="3" />
        <path d="M249.5 91.3 l3.5 0.1" strokeWidth="1.3" />
        <path d="M253.0 84.5 l3.5 0.1" strokeWidth="1.3" />
        <path d="M256.4 77.8 l3.5 0.1" strokeWidth="1.3" />
        <path d="M259.9 71.0 l3.5 0.1" strokeWidth="1.3" />
        <path d="M262.0 67.0 L280.0 75.0" strokeWidth="1.4" />
      </g>
      <g transform="translate(172 190) rotate(-38) scale(0.8) translate(0 -44)">
        <path
          className="fill-current"
          d="M1 41 L-2 38 L2 36.5 L-1 33.5 L3 32 L1 29 L7 28 Q15 24.5 21 29 L21 43 Q11 45.5 1 41Z"
        />
        <path
          className="fill-current"
          d="M19 31 Q21 15 38 14 Q51 15 53 29 L53 44 Q35 47 19 43Z"
        />
        <path
          className="fill-current"
          d="M50 25 Q58 5 82 5 Q106 8 109 30 Q108 43 96 47 L54 47 Q47 40 50 25Z"
        />
        <g className="stroke-background" fill="none" strokeLinecap="round">
          <path d="M53 27 Q70 16 104 26" strokeWidth="1.6" opacity="0.9" />
          <path d="M56 34 Q76 25 106 33" strokeWidth="1" opacity="0.45" />
          <path d="M58 40 Q78 33 104 40" strokeWidth="1" opacity="0.45" />
          <path d="M57 18 Q72 10 96 14" strokeWidth="1" opacity="0.45" />
          <path d="M52 30 Q51 38 54 46" strokeWidth="1.4" opacity="0.8" />
          <path d="M27 22 Q36 17 46 21" strokeWidth="2.2" opacity="0.35" />
          <path d="M64 13 Q76 9 88 11" strokeWidth="2.6" opacity="0.3" />
          <path d="M3 33 L9 32 M2 37 L9 36.5" strokeWidth="0.8" opacity="0.5" />
        </g>
      </g>
      <g
        className="nf-leg-a stroke-current"
        style={{ transformOrigin: "187.8px 177.7px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M187.8 177.7 L176.0 184.5" strokeWidth="4.2" />
        <path d="M176.0 184.5 L167.0 190.5" strokeWidth="3" />
        <path d="M173.5 186.2 l-3.0 -1.8" strokeWidth="1.3" />
        <path d="M171.0 187.8 l-3.0 -1.8" strokeWidth="1.3" />
        <path d="M168.5 189.5 l-3.0 -1.8" strokeWidth="1.3" />
        <path d="M167.0 190.5 L159.0 190.5" strokeWidth="1.4" />
      </g>
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "208.9px 163.2px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M208.9 163.2 L209.0 176.5" strokeWidth="4.2" />
        <path d="M209.0 176.5 L207.0 189.5" strokeWidth="3" />
        <path d="M208.4 180.1 l-3.4 1.0" strokeWidth="1.3" />
        <path d="M207.9 183.7 l-3.4 1.0" strokeWidth="1.3" />
        <path d="M207.3 187.3 l-3.4 1.0" strokeWidth="1.3" />
        <path d="M207.0 189.5 L214.0 190.5" strokeWidth="1.4" />
      </g>
      <g
        className="nf-leg-a stroke-current"
        style={{ transformOrigin: "236.6px 137.5px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M236.6 137.5 L239.0 105.0" strokeWidth="4.2" />
        <path d="M239.0 105.0 L251.0 77.0" strokeWidth="3" />
        <path d="M241.6 98.9 l3.5 -0.1" strokeWidth="1.3" />
        <path d="M244.2 92.8 l3.5 -0.1" strokeWidth="1.3" />
        <path d="M246.8 86.7 l3.5 -0.1" strokeWidth="1.3" />
        <path d="M249.4 80.7 l3.5 -0.1" strokeWidth="1.3" />
        <path d="M251.0 77.0 L266.0 85.0" strokeWidth="1.4" />
      </g>
      <path
        className="stroke-current"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M172.8 183.3 q-6 6 -11 5 M172.8 183.3 q-4 8 -9 10"
      />
    </g>
  );
}
