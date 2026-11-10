/**
 * A dung beetle in a headstand, after a photo of one at work: front legs
 * planted under the head, spiny middle legs angled back to the ground, and
 * the back legs gripping the ball from the side. The near back leg crosses
 * the ball's face; the far one grips the far side, a little higher, and is
 * lighter for depth. The whole beetle is a mid grey, so it reads against
 * the background and against the numbers, in light and dark mode.
 * Drawn in the 404 scene's coordinates (viewBox 0 0 500 210, ground at
 * y 190.5, ball centred at 300,129). Generated once, so it's static paths.
 * The legs walk in a tripod gait: nf-leg-a and nf-leg-b are the two
 * alternating sets of three (see globals.css).
 */
export default function DungBeetle() {
  return (
    <g className="text-[var(--boulder-500)]">
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "195.2px 175.6px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M195.2 175.6 L189.2 178.5" strokeWidth="4.4" />
        <path d="M189.2 178.5 Q191.2 183.5 193.2 188.5" strokeWidth="3.6" />
        <path d="M190.2 181.2 l-2.2 2.6" strokeWidth="1.3" />
        <path d="M191.3 183.9 l-2.2 2.6" strokeWidth="1.3" />
        <path d="M192.4 186.6 l-2.2 2.6" strokeWidth="1.3" />
        <path d="M193.2 188.5 L198.2 190.5" strokeWidth="1.5" />
      </g>
      <g
        className="nf-leg-a stroke-current"
        style={{ transformOrigin: "218.2px 158.3px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M218.2 158.3 L228.2 166.3" strokeWidth="4.4" />
        <path d="M228.2 166.3 Q231.6 177.2 238.2 186.5" strokeWidth="3.0" />
        <path d="M229.8 170.9 l3.4 0.4" strokeWidth="1.3" />
        <path d="M231.7 175.3 l3.4 0.2" strokeWidth="1.3" />
        <path d="M233.9 179.6 l3.4 -0.0" strokeWidth="1.3" />
        <path d="M236.4 183.7 l3.4 -0.3" strokeWidth="1.3" />
        <path d="M238.2 186.5 L243.2 190.5" strokeWidth="1.5" />
      </g>
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "236.4px 132.6px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      >
        <path d="M236.4 132.6 L237.4 123.6" strokeWidth="4.4" />
        <path d="M237.4 123.6 Q235.6 115.5 237.1 107.3" strokeWidth="3.0" />
        <path d="M236.8 120.2 l2.8 -2.0" strokeWidth="1.3" />
        <path d="M236.5 116.7 l2.9 -1.7" strokeWidth="1.3" />
        <path d="M236.5 113.3 l3.1 -1.5" strokeWidth="1.3" />
        <path d="M236.8 109.8 l3.2 -1.2" strokeWidth="1.3" />
        <path d="M237.1 107.3 L244.5 107.7" strokeWidth="1.5" />
        <path d="M244.5 107.7 L248.8 102.9" strokeWidth="1.3" />
      </g>
      <g transform="translate(178 190) rotate(-40) scale(0.8) translate(0 -44)">
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
        style={{ transformOrigin: "191.5px 178.7px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M191.5 178.7 L183.5 180.5" strokeWidth="4.4" />
        <path d="M183.5 180.5 Q184.0 185.0 184.5 189.5" strokeWidth="3.8" />
        <path d="M183.8 182.9 l-2.8 1.9" strokeWidth="1.3" />
        <path d="M184.0 185.4 l-2.8 1.9" strokeWidth="1.3" />
        <path d="M184.3 187.8 l-2.8 1.9" strokeWidth="1.3" />
        <path d="M184.5 189.5 L190.5 190.5" strokeWidth="1.5" />
      </g>
      <g
        className="nf-leg-b stroke-current"
        style={{ transformOrigin: "214.6px 161.4px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M214.6 161.4 L218.6 173.4" strokeWidth="4.4" />
        <path d="M218.6 173.4 Q223.4 181.4 230.6 187.5" strokeWidth="3.0" />
        <path d="M220.7 176.7 l3.4 -0.4" strokeWidth="1.3" />
        <path d="M223.1 179.9 l3.3 -0.6" strokeWidth="1.3" />
        <path d="M225.7 182.8 l3.3 -0.9" strokeWidth="1.3" />
        <path d="M228.5 185.6 l3.2 -1.1" strokeWidth="1.3" />
        <path d="M230.6 187.5 L236.6 190.5" strokeWidth="1.5" />
      </g>
      <g
        className="nf-leg-a stroke-current"
        style={{ transformOrigin: "231.0px 148.6px" }}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M231.0 148.6 L238.6 130.4" strokeWidth="4.4" />
        <path d="M238.6 130.4 Q243.2 127.3 248.6 126.3" strokeWidth="3.0" />
        <path d="M240.6 129.2 l2.8 1.9" strokeWidth="1.3" />
        <path d="M242.6 128.2 l2.7 2.1" strokeWidth="1.3" />
        <path d="M244.8 127.3 l2.5 2.3" strokeWidth="1.3" />
        <path d="M247.0 126.7 l2.3 2.5" strokeWidth="1.3" />
        <path d="M248.6 126.3 L254.8 123.5" strokeWidth="1.5" />
        <path d="M254.8 123.5 L260.1 117.6" strokeWidth="1.3" />
      </g>
      <path
        className="stroke-current"
        fill="none"
        strokeWidth="1.6"
        strokeLinecap="round"
        d="M178.6 183.2 q-6 6 -11 5 M178.6 183.2 q-4 8 -9 10"
      />
    </g>
  );
}
