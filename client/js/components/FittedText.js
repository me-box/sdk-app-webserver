import React, { Component, PropTypes } from 'react';
import '../../style/sass/layout.scss';
import {textWidth, textHeight} from '../utils/utils';
import {APP_TITLEBAR_HEIGHT} from '../constants/ViewConstants';

export default class FittedText extends Component {
  
    render(){

        const {w,h,data} = this.props;   
        const padding = 10;
         	
        const scale = Math.min((h-padding)/textHeight(String(data), {size: '12px'}), (w-padding) / textWidth(String(data), {size: '12px'}));
         
        const textstyle = {
        	fontSize: 12 *  scale,
        	lineHeight: `${h}px`,
        	textAlign: 'center',
        	whiteSpace: 'nowrap',
        }
        
        return 	<div style={textstyle}>
        			{data}
        		</div>
    }
}

