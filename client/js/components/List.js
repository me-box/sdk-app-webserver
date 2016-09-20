import React, { Component } from 'react';
import cx from 'classnames';

class List extends Component {
	
	constructor(props){
		super(props);
	} 

	render() {
			
		const heading = this.props.keys.map((item,i)=>{
			const className = cx({
				title: i==0,
			});
			
			return <div key={i} className={className}><div className="centered">{item}</div></div>
		});
		
		
		
		const rows = this.props.rows.map((item, i)=>{
			var items = this.props.keys.map((key,j)=>{
				const className = cx({
					title: j==0,
				});
				return <div key={j} className={className}><div className="centered">{item[key]}</div></div>
			});
			return <div key={i}>
				<div className="row">
					{items}
				</div>
			</div>
		});	
		
		return 	<div className="column">
						<div>
							<div className="row">{heading}</div>
						</div>
						{rows}
					</div>
				
	}
};

List.defaultProps = {
	rows : [],
    keys : [],	
};

export default List;