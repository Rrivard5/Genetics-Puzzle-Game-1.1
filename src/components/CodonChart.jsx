// src/components/CodonChart.jsx
import React from 'react';

const CodonChart = () => (
  <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-lg border-2 border-purple-300 shadow-xl">
    <svg viewBox="0 0 900 700" className="w-full h-auto max-h-[500px]">
      {/* Title */}
      <text x="450" y="40" textAnchor="middle" fill="#e879f9" fontSize="28" fontWeight="bold">
        Genetic Code Chart
      </text>
      
      {/* Table Header */}
      <g transform="translate(100, 80)">
        {/* Column headers - Second Position */}
        <text x="350" y="30" textAnchor="middle" fill="#a78bfa" fontSize="16" fontWeight="bold">
          Second Position
        </text>
        {['U', 'C', 'A', 'G'].map((base, i) => (
          <text 
            key={base}
            x={150 + i * 150} 
            y="60" 
            textAnchor="middle" 
            fill="#fbbf24" 
            fontSize="24" 
            fontWeight="bold"
          >
            {base}
          </text>
        ))}
        
        {/* Row labels - First Position */}
        <text x="-50" y="150" textAnchor="middle" fill="#a78bfa" fontSize="16" fontWeight="bold" transform="rotate(-90, -50, 150)">
          First Position
        </text>
        
        {/* Third Position label */}
        <text x="800" y="300" textAnchor="middle" fill="#a78bfa" fontSize="16" fontWeight="bold" transform="rotate(90, 800, 300)">
          Third Position
        </text>
        
        {/* Group background rectangles for better visual separation */}
        {[
          { first: 'U', color: '#1e293b', rowIndex: 0 }, // Slate
          { first: 'C', color: '#312e81', rowIndex: 1 }, // Indigo
          { first: 'A', color: '#581c87', rowIndex: 2 }, // Purple
          { first: 'G', color: '#7c2d12', rowIndex: 3 }  // Orange
        ].map((group) => (
          <rect 
            key={`bg-${group.first}`}
            x="120" 
            y={85 + group.rowIndex * 120} 
            width="620" 
            height="115" 
            fill={group.color}
            stroke="#475569"
            strokeWidth="3"
            rx="8"
            opacity="0.3"
          />
        ))}

        {/* Codon table */}
        {[
          { first: 'U', codons: [
            ['UUU Phe', 'UCU Ser', 'UAU Tyr', 'UGU Cys'],
            ['UUC Phe', 'UCC Ser', 'UAC Tyr', 'UGC Cys'],
            ['UUA Leu', 'UCA Ser', 'UAA Stop', 'UGA Stop'],
            ['UUG Leu', 'UCG Ser', 'UAG Stop', 'UGG Trp']
          ]},
          { first: 'C', codons: [
            ['CUU Leu', 'CCU Pro', 'CAU His', 'CGU Arg'],
            ['CUC Leu', 'CCC Pro', 'CAC His', 'CGC Arg'],
            ['CUA Leu', 'CCA Pro', 'CAA Gln', 'CGA Arg'],
            ['CUG Leu', 'CCG Pro', 'CAG Gln', 'CGG Arg']
          ]},
          { first: 'A', codons: [
            ['AUU Ile', 'ACU Thr', 'AAU Asn', 'AGU Ser'],
            ['AUC Ile', 'ACC Thr', 'AAC Asn', 'AGC Ser'],
            ['AUA Ile', 'ACA Thr', 'AAA Lys', 'AGA Arg'],
            ['AUG Met', 'ACG Thr', 'AAG Lys', 'AGG Arg']
          ]},
          { first: 'G', codons: [
            ['GUU Val', 'GCU Ala', 'GAU Asp', 'GGU Gly'],
            ['GUC Val', 'GCC Ala', 'GAC Asp', 'GGC Gly'],
            ['GUA Val', 'GCA Ala', 'GAA Glu', 'GGA Gly'],
            ['GUG Val', 'GCG Ala', 'GAG Glu', 'GGG Gly']
          ]}
        ].map((row, rowIndex) => (
          <g key={row.first}>
            {/* Thick horizontal divider line between groups */}
            {rowIndex > 0 && (
              <line 
                x1="100" 
                y1={85 + rowIndex * 120} 
                x2="750" 
                y2={85 + rowIndex * 120} 
                stroke="#475569" 
                strokeWidth="4"
              />
            )}
            
            {/* First position label with enhanced styling */}
            <rect 
              x="25" 
              y={105 + rowIndex * 120} 
              width="50" 
              height="75" 
              fill="#1f2937"
              stroke="#6b7280"
              strokeWidth="2"
              rx="8"
            />
            <text 
              x="50" 
              y={120 + rowIndex * 120 + 50} 
              textAnchor="middle" 
              fill="#fbbf24" 
              fontSize="32" 
              fontWeight="bold"
            >
              {row.first}
            </text>
            
            {/* Third position labels */}
            {['U', 'C', 'A', 'G'].map((third, thirdIndex) => (
              <text 
                key={third}
                x="770" 
                y={100 + rowIndex * 120 + thirdIndex * 30} 
                textAnchor="middle" 
                fill="#fbbf24" 
                fontSize="20" 
                fontWeight="bold"
              >
                {third}
              </text>
            ))}
            
            {/* Codon cells with colorblind-friendly colors */}
            {row.codons.map((codonRow, thirdIndex) => 
              codonRow.map((codon, secondIndex) => {
                const [codonText, aminoAcid] = codon.split(' ');
                const x = 150 + secondIndex * 150;
                const y = 100 + rowIndex * 120 + thirdIndex * 30;
                const isStop = aminoAcid === 'Stop';
                const isStart = codonText === 'AUG';
                
                // Colorblind-friendly colors with patterns
                let cellFill, textColor, pattern = null;
                if (isStop) {
                  cellFill = "#dc2626"; // Red for stops
                  textColor = "white";
                  // Add diagonal stripes pattern for stops
                  pattern = "url(#stopPattern)";
                } else if (isStart) {
                  cellFill = "#059669"; // Green for start
                  textColor = "white";
                  // Add dots pattern for start
                  pattern = "url(#startPattern)";
                } else {
                  cellFill = "#4b5563"; // Gray for regular
                  textColor = "white";
                }
                
                return (
                  <g key={`${rowIndex}-${thirdIndex}-${secondIndex}`}>
                    <rect 
                      x={x - 70} 
                      y={y - 15} 
                      width="140" 
                      height="25" 
                      fill={pattern || cellFill}
                      stroke="#6b7280" 
                      strokeWidth="1.5"
                      rx="4"
                    />
                    {/* Add border for stop/start codons for extra distinction */}
                    {(isStop || isStart) && (
                      <rect 
                        x={x - 70} 
                        y={y - 15} 
                        width="140" 
                        height="25" 
                        fill="none"
                        stroke={isStop ? "#fbbf24" : "#34d399"} 
                        strokeWidth="3"
                        rx="4"
                      />
                    )}
                    <text 
                      x={x - 35} 
                      y={y} 
                      textAnchor="middle" 
                      fill={textColor} 
                      fontSize="12" 
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {codonText}
                    </text>
                    <text 
                      x={x + 35} 
                      y={y} 
                      textAnchor="middle" 
                      fill="#fbbf24" 
                      fontSize="12" 
                      fontWeight="bold"
                    >
                      {aminoAcid}
                    </text>
                  </g>
                );
              })
            )}
          </g>
        ))}
        
        {/* Add pattern definitions for colorblind accessibility */}
        <defs>
          {/* Diagonal stripes for stop codons */}
          <pattern id="stopPattern" patternUnits="userSpaceOnUse" width="8" height="8">
            <rect width="8" height="8" fill="#dc2626"/>
            <path d="M0,8 L8,0" stroke="#fbbf24" strokeWidth="2"/>
          </pattern>
          
          {/* Dots for start codon */}
          <pattern id="startPattern" patternUnits="userSpaceOnUse" width="12" height="12">
            <rect width="12" height="12" fill="#059669"/>
            <circle cx="6" cy="6" r="2" fill="#34d399"/>
          </pattern>
        </defs>
        
        {/* Legend - Updated for colorblind accessibility */}
        <g transform="translate(0, 520)">
          <rect x="0" y="0" width="800" height="120" fill="rgba(0,0,0,0.5)" rx="10"/>
          <text x="20" y="25" fill="#e879f9" fontSize="16" fontWeight="bold">Legend:</text>
          
          {/* Start codon example */}
          <rect x="20" y="35" width="30" height="18" fill="url(#startPattern)" stroke="#34d399" strokeWidth="2" rx="3"/>
          <text x="60" y="47" fill="#34d399" fontSize="12" fontWeight="bold">Start Codon (AUG = Methionine)</text>
          
          {/* Stop codon example */}
          <rect x="280" y="35" width="30" height="18" fill="url(#stopPattern)" stroke="#fbbf24" strokeWidth="2" rx="3"/>
          <text x="320" y="47" fill="#dc2626" fontSize="12" fontWeight="bold">Stop Codons (UAA, UAG, UGA)</text>
          
          {/* Regular codon example */}
          <rect x="20" y="60" width="30" height="18" fill="#4b5563" stroke="#6b7280" strokeWidth="1" rx="3"/>
          <text x="60" y="72" fill="#d1d5db" fontSize="12">Regular Codons</text>
          
          <text x="280" y="72" fill="#fbbf24" fontSize="12">Read: 5' → 3' direction</text>
          
          {/* Additional accessibility note */}
          <text x="20" y="90" fill="#a78bfa" fontSize="11">
            Each codon is a 3-nucleotide sequence that codes for a specific amino acid
          </text>
          <text x="20" y="105" fill="#a78bfa" fontSize="10">
            ■ Patterns and borders help distinguish special codons for colorblind accessibility
          </text>
        </g>
      </g>
    </svg>
  </div>
);

export default CodonChart;
