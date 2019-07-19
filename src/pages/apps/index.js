import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import withLoadable from '../../tools/loadable'

export default function Root(props) {
	const { routes, location } = props
	return (
		<div className="transition-route">
			<TransitionGroup style={{ position: 'relative' }}>
				<CSSTransition
					key={location.key}
					classNames="fade"
					timeout={{ enter: 3000, exit: 3000 }}
				>
					<section
						style={{
							position: 'absolute',
							width: '100%',
							top: 0,
							left: 0
						}}
					>
						<Switch location={location}>
							{routes &&
								routes.map(route => (
									<Route
										key={route.label}
										{...route}
										component={props1 => {
											const MyComponent = withLoadable(
												import(`./${route.component}`)
											)
											return (
												<MyComponent
													{...props1}
													{...route}
													routes={route.routes}
												/>
											)
										}}
									/>
								))}
							<Redirect to="/🥢" />
						</Switch>
					</section>
				</CSSTransition>
			</TransitionGroup>
		</div>
	)
}
