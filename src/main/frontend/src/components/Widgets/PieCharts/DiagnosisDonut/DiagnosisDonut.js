import React, { PureComponent } from 'react';
import {
  PieChart, Pie, Tooltip, Cell,
} from 'recharts';

const data = [
  { name: 'Bone Sarcomas', value: 400 }, { name: 'Lung Adenocarcinoma', value: 300 },
  { name: 'Lymphoma', value: 300 }, { name: 'Malignant Lymphoma', value: 200 },
  { name: '(metastatic) Melanoma', value: 278 }, { name: 'Lymphomatoid Granulomatosis', value: 189 },
];
const COLORS = ['#523175','#6e7ff5','#fc4b5b','#2b69a3','#287d6d','#af66ff' ];


export default class DiagnosisDonut extends PureComponent {
  static jsfiddleUrl = 'https://jsfiddle.net/alidingling/3Leoa7f4/';

  render() {
    return (
      <PieChart width={400} height={200} onMouseEnter={this.onPieEnter}>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          fill="#8884d8"
          paddingAngle={1}
          dataKey="value"
        >
          {
            data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)
          }
        </Pie>
        <Tooltip />
      </PieChart>
    );
  }
}
