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
		let {min,max} = data;
		
		
		if (options && "min" in options){
			min = options.min;
		}
		
		if (options && "max" in options){
			max = options.max;
		}
		
        const lines = data.data.map((items,i)=>{
            const props = {...this.props, data:items, MIN: min, MAX: max, STROKEWIDTH:STROKEWIDTH, OUTERSTROKEWIDTH:OUTERSTROKEWIDTH}
            return <Line key={i} {...props} p={ (STROKEWIDTH*i*2) + OUTERSTROKEWIDTH} />
        });

		
        return <svg width={w} height={h}>
                  {lines}
                </svg>
    }
}

class Line extends Component {
 
  render() {

     

      let {MIN,MAX,data,options,w,h,p, STROKEWIDTH, OUTERSTROKEWIDTH} = this.props;
	  
      const TICKCOUNT = 10;
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
      const TOPPADDINGWIDE = p+ 10;
      const r = h > (w/2) ? (w-PADDING-STROKEWIDTH)/2 : (h-(p/2)-(STROKEWIDTH/2));

      const x1 = r => (w- (2*r))/2;
      const x2 = r => w - (w- (2*r))/2;
      const d  = r =>`M ${x1(r)} ${h} A ${r},${r} 0 0,1 ${x2(r)} ${h}`

      if (MIN == MAX){
         MIN = MAX-1;
      }


      const ticks = [...Array(_TICKCOUNT).fill(0)].map((v,tick)=>{

        const theta = radians( 180/(_TICKCOUNT+1) * (tick+1));
        
        const linestyle ={
         stroke: 'white',
         strokeOpacity: 1.0,
         strokeWidth: `30px`,
        }

        const lineprops = {
          x1: w/2 + ((r - STROKEWIDTH/1.9) * Math.cos(theta)),
          y1: h -   ((r - STROKEWIDTH/1.9) * Math.sin(theta)),
          x2: w/2 + ((r + STROKEWIDTH/1.9) * Math.cos(theta)),
          y2: h -   ((r + STROKEWIDTH/1.9) * Math.sin(theta)),
        }
        return <line key={tick} style={linestyle} {...lineprops}/>
      });

    
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
                    {false && ticks}
                   
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


