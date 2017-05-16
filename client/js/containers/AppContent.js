import React, { Component } from 'react';
import {connect} from 'react-redux';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {APP_TITLEBAR_HEIGHT} from '../constants/ViewConstants';
import { bindActionCreators } from 'redux';
import '../../style/sass/style.scss';
import cx from 'classnames';
import List from '../components/List';
import Chart from '../components/Chart';
import Gauge from '../components/Gauge';
import FittedText from '../components/FittedText';
import UIBuilder from '../components/uibuilder/UIBuilder';

import {MAXREADINGS} from '../constants/ChartConstants';
import * as AppActions from '../actions/AppActions';
import {fetchChannelId} from '../actions/ChannelActions';
import {windowResize} from '../actions/WindowActions';

function lookup(boxes, name){
    return  boxes.reduce((acc, arr, i)=>{
        return arr.reduce((_acc, item, j)=>{
            if (item === name){
                return {row: i, col: j};
            }
            return _acc;
        }, acc);

    },{row:-1,col:-1});
}

class AppContent extends Component {
	
	constructor(props){
		super(props);
		Object.assign(this, ...bindActionCreators(AppActions, props.dispatch));	
		this.windowResize  = bindActionCreators(windowResize, props.dispatch);
		this._handleResize = this._handleResize.bind(this);
	} 
	
	componentDidMount(){
		this.props.dispatch(fetchChannelId());
  		window.addEventListener('resize', this._handleResize);
	}

	render() {
	
		const flexcontainer = {
			height: `calc(100vh - 0px)`,
			width: `calc(100vw - 5px)`,
		}
		
		const { apps, layout, dispatch, dimensions } = this.props;
		const {w,h} = dimensions;
		const height = h;
		
		const totalrows = layout ? Object.keys(layout).length : 1;
		const APPCONTAINERHEIGHT = (height / totalrows);
		
	    const applist = Object.keys(apps).map((appkey,i)=>{
	    	  
	        const approw = apps[appkey];
	        
	        return Object.keys(approw).map((sourcekey,j)=>{
	    		
	    		const {row,col} = layout ? lookup(layout[appkey],sourcekey) : {row:i, col:j};
	    		
	    		//console.log(`for app ${appkey}, source:${sourcekey} row is ${row} col is ${col}`);
	    	
	    		
	    		const app = approw[sourcekey];
	    		const totalcols = layout  && layout[appkey] && layout[appkey][row] ? layout[appkey][row].length : Object.keys(approw).length;
	    		//console.log(`total cols is ${totalcols}`);
	    		//console.log(`total cols for app ${appkey}, source:${sourcekey} are ${totalcols} and total rows are ${layout[appkey].length}`); 
	    		
	    		const APPHEIGHT =  (APPCONTAINERHEIGHT - APP_TITLEBAR_HEIGHT) / (layout && layout[appkey] ? layout[appkey].length : totalrows); 
	    		
	    		//console.log(`APPCONTAINERHEIGHT IS ${APPCONTAINERHEIGHT} APPHEIGHT = ${APPHEIGHT}`);
	    		
	    		const APPWIDTH  = (w/totalcols);
	    		
				let style = {
					position: 'absolute',
					width: APPWIDTH,
					left: APPWIDTH * col,
					height: APPHEIGHT,
					top:  APP_TITLEBAR_HEIGHT + (APPCONTAINERHEIGHT * i) + (APPHEIGHT * row),		
				}
			
				let dataview = null;
			
				const {options,data} = app;
			
				
				switch (app.view){	
				
					case 'uibuilder':
						dataview = 	<UIBuilder {...{w: APPWIDTH, h: APPHEIGHT, sourceId: app.sourceId}} />
						break;

					case 'html':
						
						dataview = <div style={{width:w, height:h}}>
								   		<div style={{width:w, height:h}} dangerouslySetInnerHTML={{__html: data}}></div>
								   </div>
						break;
						
					case 'gauge':
						dataview = 	<Gauge {...{w: APPWIDTH, h: APPHEIGHT, options: options, data: app}} /> 	
						break;
					
					case 'bar':
					
						dataview = 	<Chart {...{w: APPWIDTH, h: APPHEIGHT, options: options, data: data.slice(-MAXREADINGS)}} /> 	
						break;
					
					case 'text':
						dataview = <FittedText {...{w:APPWIDTH,h:APPHEIGHT, data: data || ""}} />;
						break;
								
					case 'list':
					
						if (data === Object(data)){ //if this is a valid javascript object
							const props = {keys: data.keys || [], rows: data.rows || []};
							dataview = <List {...props}/>
						}
						break;
			
				}


				const {view} =  app;

				const classname = cx({
					flexitem: true,
					[view]:true,
				})

				const titlebar = {
					position: 'absolute',
					left: 0,
					top: (APPCONTAINERHEIGHT * i),
					height: APP_TITLEBAR_HEIGHT,
					width: w,
					boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
					background: '#445662',
					color: 'white',
					fontSize: '1.3em',
					lineHeight: `${APP_TITLEBAR_HEIGHT}px`,
					textAlign: 'center',
				}
					
				const remove = {
					width: 40,
					WebkitBoxFlex: 0, 
					WebkitFlex: '0 0 auto',
					flex: '0 0 auto',
				}
				
				/*{j==0 && <div style={titlebar}>
								<div className="row">
									<div style={remove}>
										<div className="centered" onClick={this.appRemoved.bind(this, app.id)}><i className="fa fa-times fa-fw"></i></div>
									</div>
									<div>
										<div className="centered">{app.name}</div>
									</div>
								</div>
							</div> }
							<div key={`${appkey}${sourcekey}`} style={style}>
								<div style={{width:"inherit", height:"inherit"}} key={i} className={classname}>
									{dataview}
								</div>		
					   		</div>*/

				return  <div>
							<div key={`${appkey}${sourcekey}`} style={style}>
								<div key={i} className={classname}>
									{dataview}
								</div>		
					   		</div>
					   	</div>     
			        
	        });
	    	
	    });

	    return <ReactCSSTransitionGroup className="container" style={flexcontainer} transitionName="flexitem" transitionEnterTimeout={500} transitionLeaveTimeout={300}>{applist}</ReactCSSTransitionGroup>
         	
	}

	 _handleResize(e){
      const w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      this.windowResize(w,h);
    }
};

function select(state) {
  return {
    apps: state.apps,
    layout: state.layout,
    dimensions: state.screen.dimensions,
  };
}

AppContent.contextTypes = {
	store: React.PropTypes.object,
}

export default connect(select)(AppContent);
