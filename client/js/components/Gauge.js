import React, { Component, PropTypes } from 'react';
import '../../style/sass/layout.scss';
import {Motion, spring, presets} from 'react-motion';
import {textWidth} from '../utils/utils';
import {APP_TITLEBAR_HEIGHT} from '../constants/ViewConstants';
const colours = ["#1f77b4","#ff7f0e","#2ca02c","#d62728","#9467bd","#8c564b","#e377c2","#7f7f7f","#bcbd22","#17becf"];
const lookup = [];

const _colourFor = (id)=>{
	let index = lookup.indexOf(id);

  	if (index === -1){
     	lookup.push(id);
     	index = lookup.length - 1;
  	}
	
  	return colours[index%colours.length];
}

const radians = (degrees)=>{
    return degrees * (Math.PI/180);
}

const degrees = (radians)=>{
    return radians * (180/Math.PI);
}

export default class Gauge extends Component {
  
    render(){

        const {w,h,options, data} = this.props;
        
        
        if (data.data.length < 0 )
          return null;

        const STROKEWIDTH      = 80;
        const OUTERSTROKEWIDTH = 5;
        const BORDERPADDING    = 30;
		let {min,max} = data;
		
		
		if (options && "min" in options){
			min = options.min;
		}
		
		if (options && "max" in options){
			max = options.max;
		}
		
        const lines = data.data.map((items,i)=>{
            const props = {	...this.props, 
            				data:items, 
            				MIN: min, 
            				MAX: max,
            				p: (STROKEWIDTH*i*2) + OUTERSTROKEWIDTH, 
            				STROKEWIDTH, 
            				OUTERSTROKEWIDTH, 
            				BORDERPADDING
            				
            				}
            return <Line key={i} {...props} />
        });
        
        let labels = [];
        if (options.labels){
        	var labelarray = options.labels.split(",");
        	labels = labelarray.reduce((acc, label)=>{
        		const [name,value] = label.split(":");
        		if (name && value){
        			
        			
        			if (value.trim() === "max"){
        				acc.push({value:max, text:name});
        			}
        			else if (value.trim() === "min"){
        				acc.push({value:min, text:name});
        			}
        			else if (!isNaN(parseFloat(value)) && isFinite(value)){
        				acc.push({value:value, text:name});
        			}
        		}
        		return acc;
        	},[]);
        }
        
		const markers = labels.map((marker)=>{
			marker.value = Math.min(Math.max(min, marker.value),max);
			return marker;
		}).map((marker,i)=>{
        	
        	const from  = (i == 0) ? min : labels[i-1].value;
        	
        	const markerprops = {
        		STROKEWIDTH,
        		OUTERSTROKEWIDTH,
        		BORDERPADDING,
        		max,
        		min,
        		w,
        		h,
        		from: from,
        		to: marker.value,
        		text: marker.text,
        	}
        	
        	return <Marker {...markerprops}/>
        });
        
		const TITLESIZE = 30;
		const textstyle = {
                              textAnchor:"middle",
                              fill: 'white',
                              fontSize: TITLESIZE,
                       }
		
		//const r = h > (w/2) ? (w-OUTERSTROKEWIDTH-STROKEWIDTH)/2 : (h-(STROKEWIDTH/2));
        const r = h > (w/2) ? (w-OUTERSTROKEWIDTH-STROKEWIDTH)/2 : (h-(STROKEWIDTH/2));
       
        const textprops = {
                                x:w/2,
                                y:h-r-TITLESIZE-APP_TITLEBAR_HEIGHT,
        }
		
        return <svg width={w} height={h}>  
                 {lines}
                 <g><text style={textstyle} {...textprops}> {options.title || ""} </text></g>
                  {markers}      
                </svg>
    }
}


class Marker extends Component {
	
	render(){
	 
	  const {STROKEWIDTH, OUTERSTROKEWIDTH, BORDERPADDING,  max, min, w, h, from, to, center, text} = this.props;
	  
	  const PADDING = OUTERSTROKEWIDTH;
	  const FONTSIZE = 30;
	  
      const r = h > (w/2) ? (w-PADDING-STROKEWIDTH)/2 + BORDERPADDING - OUTERSTROKEWIDTH : (h-(STROKEWIDTH/2)) + BORDERPADDING - OUTERSTROKEWIDTH;
	 
	  const angle = (value)=>{
        const divisor = max-min;
        return Math.PI - radians((value - min)  * (180/divisor));
      }
      
      
	  const ADJUST = 0;
	   
      const ypos = (value)=>{
        return h - ((r-ADJUST) * Math.sin(angle(value)));
      }

      const xpos = (value)=>{
        return w/2 + ((r-ADJUST) * Math.cos(angle(value)));
      }
	
	  const markerstyle = {
         fill: 'red',
         fillOpacity: 1.0,
         stroke: '#4d4d4d',
         strokeOpacity: 1.0,
         strokeWidth: '3px',
	  }
	  
	  const markerstyle2 = {
         fill: 'green',
         fillOpacity: 1.0,
         stroke: '#4d4d4d',
         strokeOpacity: 1.0,
         strokeWidth: '3px',
	  }
	  
	  const fromr = r-BORDERPADDING/2-ADJUST;
	  const tor = r+BORDERPADDING/2-ADJUST;
	  const theta = angle(from);
	  const lineprops = {
		  x1:w/2 + (fromr * Math.cos(theta)),
		  y1: h - (fromr * Math.sin(theta)),
		  x2: w/2 + (tor * Math.cos(theta)),
		  y2: h - (tor * Math.sin(theta)),
      }
	  
	 const linestyle ={
         stroke: '#4d4d4d',
         strokeOpacity: 1.0,
         strokeWidth: `3px`,
     }
	
		  
    const arcstyle = {
         fill: 'none',
         stroke: _colourFor(text),
         strokeOpacity: 1.0,
         strokeWidth: `${BORDERPADDING}px`,
    }
      
    
	const xs = xpos(from);
	const xe = xpos(to);
	const ys = ypos(from); 
	const ye = ypos(to);
	
	
 	const path = `M ${xs} ${ys} A ${r-ADJUST},${r-ADJUST} 0 0,1 ${xe} ${ye}`;
	const labelr = r - (BORDERPADDING/2) + 5;
	const texttheta = angle(from + ((to-from) / 2));
	
	const textstyle = {
        textAnchor:"middle",
        fill: 'white',
        fontSize: `${FONTSIZE}px`,
    }
    
    const textprops = {
        x:0,
        y:0,
        transform: `translate(${w/2 + (labelr * Math.cos(texttheta))}, ${h -(labelr * Math.sin(texttheta))}) rotate(${90-degrees(texttheta)})`,
    } 
      
    return  	<g>
	  				
	  				<path style={arcstyle} d={path}/>
	  				<text style={textstyle} {...textprops}>{text}</text>
	  				<line style={linestyle} {...lineprops} />  
	  			</g>
	
	}
}

class Line extends Component {
 
  render() {

      const {MAX,data,options,w,h,p, STROKEWIDTH, OUTERSTROKEWIDTH,BORDERPADDING} = this.props;
	  let {MIN} = this.props;
	  
      const TICKCOUNT = options.ticks || 10;
      const _TICKCOUNT = TICKCOUNT + 1;

      
      if (data.length <= 0){
        return null;
      }

      const arcstyle = {
         fill: 'none',
         stroke: _colourFor(data[0].id),//'#1f77b4',
         strokeOpacity: 1.0,
         strokeWidth: `${STROKEWIDTH}px`,
      }

      const outerstyle = {
         fill: 'none',
         stroke: '#4d4d4d',
         strokeOpacity: 1.0,
         strokeWidth: `${OUTERSTROKEWIDTH}px`,
      }

      const PADDING = p + OUTERSTROKEWIDTH;
      const r = h > (w/2) ? (w-PADDING-STROKEWIDTH)/2 - BORDERPADDING : (h-(p/2)-(STROKEWIDTH/2) - BORDERPADDING);

      const x1 = r => (w- (2*r))/2;
      const x2 = r => w - (w- (2*r))/2;
      const d  = r =>`M ${x1(r)} ${h} A ${r},${r} 0 0,1 ${x2(r)} ${h}`

      if (MIN == MAX){
         MIN = MAX-1;
      }
    
      const pointerstyle = {
         fill: 'white',
         fillOpacity: 1.0,
         stroke: '#4d4d4d',
         strokeOpacity: 1.0,
         strokeWidth: '3px',
      }
      
      const linestyle = {
        stroke: '#4d4d4d',
        strokeWidth: '3px',
      }

      const angle = (value)=>{
        const divisor = MAX-MIN;
        return Math.PI - radians((value - MIN)  * (180/divisor));
      }

      const ypos = (value)=>{
        return h - (r * Math.sin(angle(value)));
      }

      const xpos = (value)=>{
        return w/2 + (r * Math.cos(angle(value)));
      }
      
    const start = data.length > 1 ? Number(data[data.length-2].x) : Number(data[data.length-1].x);
    const end   = Number(data[data.length-1].x);
    
    let innerd;

    const pointer  = <Motion defaultStyle={{x:start}} style={{x:spring(end, {stiffness: 100, damping: 50})}}>
                        { value => {
                           
                           const xval = xpos(value.x);
                           const yval = ypos(value.x);
                           const fromr = r - STROKEWIDTH/2;
                           const tor = r + STROKEWIDTH/2;
                           const path = `M ${x1(r)} ${h} A ${r},${r} 0 0,1 ${xval} ${yval}`;
                           
                           const lineprops = {
                              x1:w/2 + (fromr * Math.cos(angle(value.x))),
                              y1: h - (fromr * Math.sin(angle(value.x))),
                              x2: w/2 + (tor * Math.cos(angle(value.x))),
                              y2: h - (tor * Math.sin(angle(value.x))),
                           }

                           return <g>
                                    <InnerPath colour={_colourFor(data[0].id)} path={path} STROKEWIDTH={STROKEWIDTH}/>
                                    <line {...lineprops} style={linestyle}/>
                                   
                                  </g>
                          }
                        }
                     </Motion>
      

      const pcircle  = <Motion defaultStyle={{x:start}} style={{x:spring(end, {stiffness: 100, damping: 50})}}>
                        { value => {
                          
                           const FONTSIZE = 20;

                           const xval = xpos(value.x);
                           const yval = ypos(value.x);
                           
                         
                           const labelr = (r - STROKEWIDTH/2) + (STROKEWIDTH-FONTSIZE/2)/2;
                           const theta = angle(value.x);

                           

                           const textstyle = {
                              textAnchor:"middle",
                              fill: '#4d4d4d',
                              fontSize: FONTSIZE,
                            }

                            const textprops = {
                                x:0,
                                y:0,
                                  transform: `translate(${w/2 + (labelr * Math.cos(theta))}, ${h -(labelr * Math.sin(theta))}) rotate(${90-degrees(theta)})`,
                            }

                           return <g>
                                    <circle style={pointerstyle} r={(STROKEWIDTH/2)-8} cx={xval} cy={yval} />
                                    <text style={textstyle} {...textprops}> {value.x.toFixed(1)} </text>
                                  </g>
                          }
                        }
                     </Motion>
      
      return      <g>
                    <path style={outerstyle} d={d(r+STROKEWIDTH/2+OUTERSTROKEWIDTH/2)}/>
                    <path style={arcstyle} d={d(r)}/>
                    <path style={outerstyle} d={d(r-STROKEWIDTH/2-OUTERSTROKEWIDTH/2)}/>
                    <TickLabels MAX={MAX} MIN={MIN} value={end} r={r} TICKCOUNT={_TICKCOUNT} STROKEWIDTH={STROKEWIDTH} w={w} h={h}/>
                     {pointer}
                    {pcircle}
                  </g>
                
               
           
  }
}


class InnerPath extends Component{

    render(){
        const {STROKEWIDTH, path, colour} = this.props;
        const innerarcstyle = {
            fill: 'none',
            stroke: '#808080',//colour, //'white',// '#ff5555',
            strokeOpacity: 1.0,
            strokeWidth: `${STROKEWIDTH}px`,
        }
        return <path style={innerarcstyle} d={path}/>
    }
}

class TickLabels extends Component {
 
    render() {
          
          const {r, STROKEWIDTH, TICKCOUNT, TICKDELTA, MAX, MIN, w, h} = this.props;
    
          const tickcircles = [...Array(TICKCOUNT-1).fill(0)].map((v,tick)=>{
            
            tick = tick + 1;
            const value = MIN + (TICKCOUNT-tick) * (MAX-MIN)/(TICKCOUNT);
            
            //const deg = (180/(TICKCOUNT+1) * (tick+1));
            const deg = 180/TICKCOUNT * tick;

            const theta = radians(deg);

        
            const FONTSIZE = 30;

            const labelr = (r - STROKEWIDTH/2) + (STROKEWIDTH-FONTSIZE/2)/2;

            const textstyle = {
              textAnchor:"middle",
              fill: 'white',
              fontSize: FONTSIZE,
            }

            const textprops = {
                x:0,
                y:0,
                transform: `translate(${w/2 + (labelr * Math.cos(theta))}, ${h -(labelr * Math.sin(theta))}) rotate(${90-deg})`,
            }
              //<circle style={circlestyle} cx={w/2 + (labelr * Math.cos(theta))} cy={ h -(labelr * Math.sin(theta))} r={STROKEWIDTH}/>s
            return <g key={tick}>  
                      <text style={textstyle} {...textprops}>{value.toFixed(1)}</text>
                    </g>
          });

          return <g>{tickcircles}</g>
    }
}