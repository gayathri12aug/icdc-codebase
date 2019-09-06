import React, { PureComponent } from 'react';
import {
  PieChart, Pie, Tooltip, Cell,
} from 'recharts';

const data = [
  { name: 'Lymphoma', value: 400 },
  { name: 'Osteosarcoma', value: 300 },
  { name: 'Lipoma', value: 300 },
  { name: 'Oral Melanoma', value: 200 },
  { name: 'Mammary Gland Carcinoma', value: 400 },
  { name: 'Primary Lung Tumor', value: 300 },
  { name: 'Thyroid Carcinoma', value: 300 },
  { name: 'Hemangiosarcoma', value: 200 },
  
];
const COLORS = ['#523175','#6e7ff5','#fc4b5b','#2b69a3','#287d6d','#af66ff' ];


export default class TumorDonut extends PureComponent {

  render() {
    return (
      <PieChart width={400} height={200} onMouseEnter={this.onPieEnter}>
        <Pie
          data={data}
          cx="55%"
          cy="50%"
          innerRadius={60}
          outerRadius={95}
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
