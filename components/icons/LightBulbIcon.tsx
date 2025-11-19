
import React from 'react';

const LightBulbIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-1.94c.913.443 1.5 1.401 1.5 2.5 0 1.099-.587 2.057-1.5 2.5v-.56m-3 0v.56c-.913-.443-1.5-1.401-1.5-2.5 0-1.099.587-2.057 1.5-2.5V18m3-1.94v-.01m-3 0v-.01m6.75-4.05c0-3.728-3.022-6.75-6.75-6.75S5.25 5.272 5.25 9c0 2.307 1.18 4.35 3 5.558v.017c0 .815.656 1.475 1.471 1.475h2.558c.815 0 1.471-.66 1.471-1.475v-.017c1.82-1.208 3-3.251 3-5.558Z" />
  </svg>
);

export default LightBulbIcon;
