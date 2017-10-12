import React, { Component } from 'react';
import cx from 'classnames';
import {APP_TITLEBAR_HEIGHT} from '../constants/ViewConstants';
import {TOPPADDING,LEFTPADDING,RIGHTPADDING,CHARTXPADDING,CHARTYPADDING,TICKCOUNT,BARSPACING,YAXISVALUESIZE, AXISLABELSIZE} from '../constants/ChartConstants';

import moment from 'moment';
import {textWidth} from '../utils/utils';

const colours = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
const lookup = [];
const keylookup = {};

const _colourFor = (id)=>{
	
	let index = lookup.indexOf(id);

  	if (index === -1){
     	lookup.push(id);
     	index = lookup.length - 1;
  	}
	
  	return colours[index%colours.length];
}

class Chart extends Component {
	
	constructor(props){
		super(props);
	} 
	
	render() {
		
		const {w, h, options, data} = this.props;
	
		return 	<BarChart {...{w, h, options,data}} />
				
	}
};


class BarChart extends Component {
	

	renderDefs(){
		return <defs>
	               <filter id="shadow">
	                  <feFlood
	                     floodOpacity="0.498039"
	                     floodColor="rgb(0,0,0)"
	                     result="flood"
	                      />
	                  <feComposite
	                     in="flood"
	                     in2="SourceGraphic"
	                     operator="in"
	                     result="composite1"
	                    />
	                  <feGaussianBlur
	                     in="composite1"
	                     stdDeviation="1.4"
	                     result="blur"
	                     />
	                  <feOffset
	                     dx="1.5"
	                     dy="2.85882e-15"
	                     result="offset"
	                     />
	                  <feComposite
	                     in="SourceGraphic"
	                     in2="offset"
	                     operator="over"
	                     result="composite2"
	                     />
	                </filter>
	            </defs>
	}

	renderTicks(MAX, RANGEMIN, CLOSESTPOINTTOORIGIN, TICKDELTA, BARWIDTH, DATALENGTH, yPos){
		

		const linestyle = {
		  stroke: "#d4d4d4",
		  strokeWidth: '1px',
		  strokeOpacity: 0.5,
		}

		const circlestyle = {
		  stroke: "#fff",
		  strokeWidth: '1px',
	 	  fill: "#37474f",  
		}

		return [...Array(TICKCOUNT+1).fill(0)].map((v,tick)=>{
			
			const y = yPos(Math.min(MAX, Math.min(MAX,(RANGEMIN - CLOSESTPOINTTOORIGIN) + ((tick)*TICKDELTA))));

			const lineprops = {
			  x1: 0,
			  y1: y, 
			  x2: BARWIDTH * DATALENGTH,
			  y2: y, 
			} 
  
  			const circleprops = {
  				r: 5,
  				cx: CHARTXPADDING,
  				cy: y, 
  			}
		
			return  <g key={tick+1}>				
						<line  {...lineprops} style={linestyle}/>
						<circle {...circleprops} style={circlestyle}/>
					</g>
		});
	}

	renderXLabels(data, BARWIDTH, XAXISVALUESIZE, XLABELWIDTH){
		return data.map((item,i)=>{
			  
			const label = item.x;
			const style = {
				position: 'absolute',
				left:  CHARTXPADDING + ((i + 1) * BARWIDTH) - (BARWIDTH-XAXISVALUESIZE)/2,
				height: XAXISVALUESIZE + 1,
				width: XLABELWIDTH,
				bottom: -XAXISVALUESIZE,
				transform: 'rotate(90deg)',
				transformOrigin: 'left top 0',
				fontSize: XAXISVALUESIZE,
				textAlign: 'left',
			}

			return 	<div key={`${item.id} ${item.dataid}`} style={style}>
						{label}
					</div>
		});
	}


	renderYLabels(RANGEMIN, MAX, CLOSESTPOINTTOORIGIN, TICKDELTA, CHARTHEIGHT, yPosAxis){

		return [...Array(TICKCOUNT+2).fill(0)].map((v,tick)=>{

			  const value = RANGEMIN - CLOSESTPOINTTOORIGIN + (tick * TICKDELTA);

			  //prevent labels off chart
			  if (value >= MAX || value <= RANGEMIN)
				return null;

			  //prevent tick labels overlapping with max/min
			  const y = yPosAxis(value);   
	  
			  if (y < YAXISVALUESIZE ||  (CHARTHEIGHT-y) < YAXISVALUESIZE)
				  return null;

		
			  const style = {
				position: 'absolute',
				left: -YAXISVALUESIZE*2,
				top:  y,        
				fontSize: YAXISVALUESIZE,
			  }

			  return <div key={tick} style={style}>{value.toFixed(1)}</div>
		});
	}

	renderYMin(min, yPosAxis){
		const minstyle = {
			position: 'absolute',
			top: yPosAxis(min),
			left: -YAXISVALUESIZE*2,
			fontSize: YAXISVALUESIZE,
			fontWeight: 'bold',
		}

		return <div style={minstyle}>{min.toFixed(1)}</div>
	}

	renderYMax(max, yPosAxis){
		const maxstyle = {
			position: 'absolute',
			top: yPosAxis(max),
			left: -YAXISVALUESIZE*2,
			fontSize: YAXISVALUESIZE,
			fontWeight: 'bold',
		}

		return <div style={maxstyle}>{max.toFixed(1)}</div>
	}

	renderYAxis(CHARTHEIGHT){
		const axislinestyle = {
		  strokeWidth: '2px',
		  stroke: '#fff',
		}

		const yaxisprops = {
		  x1: CHARTXPADDING,
		  x2: CHARTXPADDING,
		  y1: 0,
		  y2: CHARTHEIGHT,
		}
		return <line style={axislinestyle} {...yaxisprops}/>
	}

	renderXAxis(CHARTWIDTH, CHARTHEIGHT){
		const axislinestyle = {
		  strokeWidth: '2px',
		  stroke: '#fff',
		}

		const xaxisprops = {
		  x1: CHARTXPADDING, 
		  x2: CHARTWIDTH,
		  y1: CHARTHEIGHT,
		  y2: CHARTHEIGHT,
		}
		return  <line style={axislinestyle} {...xaxisprops}/>
	}

	renderZeroAxis(CHARTWIDTH, y){
		
		const zeroAxisprops = {
		  x1: CHARTXPADDING, 
		  x2: CHARTWIDTH,
		  y1: y,
		  y2: y,
		}

		const zeroAxisStyle = {
		  strokeWidth: '2px',
		  stroke: '#fff',
		}
		return <line style={zeroAxisStyle} {...zeroAxisprops}/>
	}

	renderReadings(data, BARWIDTH, RANGEMIN, yPos){
		
		return data.map((item, i)=>{
 
			const style = {
				fill: _colourFor(item.id),
				fillOpacity: 1.0,
				stroke: _colourFor(item.id),
				strokeOpacity: 1.0,
				strokeWidth: '1px',
			
			}
  
  			
			const rectprops = {
				x: CHARTXPADDING + (BARWIDTH * i) + (BARSPACING/2),
				y: item.y > 0 ? yPos(item.y) : yPos(0), 
				rx:5,
				width: Math.max(1,BARWIDTH - BARSPACING),
				height: Math.abs(yPos(Math.max(RANGEMIN,0))-yPos(item.y)),						
			}
		  
		 	return <rect key={`${item.id} ${item.dataid}`} className="animated" style={style} {...rectprops} />
		});

	}  

	renderXLabel(options, CHARTWIDTH, CHARTHEIGHT, XLABELWIDTH){
		
		const xLabelStyle = {
			  width: CHARTWIDTH,
			  color: "#fff",
			  position: 'absolute',
			  left: LEFTPADDING,
			  top: TOPPADDING + CHARTHEIGHT + XLABELWIDTH + 10,
			  textAlign: 'center',
			  fontSize: AXISLABELSIZE,
			  height: AXISLABELSIZE +1,
			  overflow: 'hidden',
		 }

 		return <div style={xLabelStyle}>{options.xlabel || ""}</div>
	}

	renderYLabel(options, CHARTHEIGHT){
		
		const yLabelStyle = {
			  width: CHARTHEIGHT,
			  height: AXISLABELSIZE + 1,
			  color: "#fff",
			  position: 'absolute',
			  left: 0,
			  top: TOPPADDING + CHARTHEIGHT,
			  transform: 'rotate(-90deg)',
			  transformOrigin: 'left top 0',
			  textAlign: 'center',
			  fontSize: AXISLABELSIZE,
		  	  overflow: 'hidden',
		}
		return <div style={yLabelStyle}>{options.ylabel || ""}</div>
	}

	renderKeys(data, CHARTWIDTH){
		let maxkeylen = 0;
		
		const ids = data.reduce((acc,item)=>{
			acc[item.id] = textWidth(item.id, {size:"16px"})
			maxkeylen = Math.max(maxkeylen, acc[item.id]);
			return acc;
		},{});
		
		const KEYRADIUS = 8;
		
		return Object.keys(ids).sort().map((key, i)=>{
			const circleprops = {
				cx: CHARTWIDTH -  maxkeylen - KEYRADIUS - 5,
				cy: TOPPADDING + (i * (KEYRADIUS*3)),
				r: KEYRADIUS,
			}
			
			const circlestyle ={
				fill: _colourFor(key),
				stroke: "#37474f",
				strokeWidth: "2px",
				//filter: 'url(#shadow)',
			}
			
			const textprops = {
				x: CHARTWIDTH -  maxkeylen,
				y: TOPPADDING + KEYRADIUS/2 + (i * (KEYRADIUS*3)),
				//textAnchor: 'middle',
			}
			
			const textstyle ={
				fill: 'white',
				
			}
			
			return <g>
						<circle key={i} {...circleprops} style={circlestyle}/>
				   		<text {...textprops} style={textstyle}>{key}</text>
				   </g>
		});
	}

	renderTitle(title, CHARTWIDTH){
		const style = {
			width: CHARTWIDTH,
			textAlign: 'center',
			fontSize: 20,
			position: 'absolute',
			top: 10,
			color: 'white',
		}
		return <div style={style}>{title}</div>
	}

	render(){
	
		const {w, h, data, options={}} = this.props;
		
		if (data.length <= 0){
			return null;
		}
		
		const BARWIDTH = (w-LEFTPADDING-RIGHTPADDING-CHARTXPADDING)/data.length;
		const XAXISVALUESIZE = Math.min(14,BARWIDTH/2);
		
		//calculate the amount of bottom padding we need based on the max width of the x-axis labels
		const longestlabel = data.reduce((acc, obj)=>{
			if (obj.x){
				if (String(obj.x).length > acc.length){
					acc = String(obj.x);
				}
			}
			return acc;
		},""); 
		
		const XLABELWIDTH = textWidth(longestlabel, {size:`${XAXISVALUESIZE}px`}) + CHARTYPADDING + 2;
		const CHARTHEIGHT = h - TOPPADDING - XLABELWIDTH - CHARTXPADDING - AXISLABELSIZE;
		const CHARTWIDTH  = w - LEFTPADDING - RIGHTPADDING;

		const MAX = data.reduce( (acc, item)=>{
		  return Math.max(acc, item.y);
		}, 0);

		let MIN = data.reduce( (acc, item)=>{
		  return Math.min(acc, item.y);
		}, Number.MAX_VALUE);

		if (MIN == MAX){
		   MIN = MAX-0.1;
		}

		const ORIGIN =  MIN < 0 ? 0 : MIN;
		const TICKDELTA = (MAX-MIN)/(TICKCOUNT);
		const RANGEMIN = MIN < 0 ? MIN : Math.max(0,MIN - TICKDELTA);
		const CLOSESTPOINTTOORIGIN = MAX - (Math.round(MAX/TICKDELTA) * TICKDELTA);

		const yPos = (value)=>{
			const divisor = MAX-RANGEMIN;
			const yp = CHARTHEIGHT - ((value - RANGEMIN)  * (CHARTHEIGHT/divisor));
			return yp;
		};

		const yPosAxis = (value)=>{ 
		   return yPos(value) - YAXISVALUESIZE/2;
		};
 
      	return (
            <div>
            	{this.renderTitle(options.title || "", CHARTWIDTH)}
                {this.renderYLabel(options, CHARTHEIGHT)}
                {this.renderXLabel(options, CHARTWIDTH, CHARTHEIGHT, XLABELWIDTH)}
                <div style={{position:'absolute', top:TOPPADDING, left:LEFTPADDING}}>
                	{this.renderYMin(RANGEMIN, yPosAxis)}
                  	{this.renderYMax(MAX, yPosAxis)}
                  	{this.renderXLabels(data, BARWIDTH, XAXISVALUESIZE, XLABELWIDTH)}
                  	{this.renderYLabels(RANGEMIN, MAX, CLOSESTPOINTTOORIGIN, TICKDELTA, CHARTHEIGHT, yPosAxis)}

                  	<svg width={CHARTWIDTH} height={CHARTHEIGHT}>
                    	{this.renderDefs()}
                   	 	<g>
                      		{this.renderYAxis(CHARTHEIGHT)}
                      		{RANGEMIN < 0 && this.renderZeroAxis(CHARTWIDTH, yPos(0))}
                      		{this.renderTicks(MAX, RANGEMIN, CLOSESTPOINTTOORIGIN, TICKDELTA, BARWIDTH, data.length, yPos)}
                      		{this.renderReadings(data, BARWIDTH, RANGEMIN, yPos)}
                      		{MIN > 0 && this.renderXAxis(CHARTWIDTH, CHARTHEIGHT)}
                      		{this.renderKeys(data, CHARTWIDTH)}
                    	</g>
                  	</svg>
                </div>
            </div>
		);	
	}
}

Chart.defaultProps = {
	data : {},	
};
 
export default Chart;