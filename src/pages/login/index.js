import React, { useState } from 'react'
import { withApollo } from 'react-apollo'
import gql from 'graphql-tag'
import { inject, observer } from 'mobx-react'
import { Row, Col, Form, Typography, Icon, Input, Button } from 'antd'
import './index.scss'

import openNotificationWithIcon from '../../components/shared/openNotificationWithIcon'

const { Title } = Typography

function Login(props) {
	const [loading, setLoading] = useState(false)
	function handleSubmit(e) {
		e.preventDefault()
		setLoading(true)
		props.form.validateFields((err, values) => {
			if (!err) {
				// console.log('Received values of form: ', values)
				const { username, password } = values
				props.client
					.mutate({
						mutation: USER_LOGIN,
						variables: {
							input: {
								username,
								password
							}
						}
					})
					.then(res => {
						// console.log(res.data.login)
						const mess = "Your account doesn't have any permissions"
						const { token, userPermissions } = res.data.login
						setLoading(false)
						if (
							userPermissions.length > 0 &&
							userPermissions[0].permissions.length > 0
						) {
							props.store.authStore.authenticate(token, userPermissions)
							props.history.push('/🥢')
						} else {
							openNotificationWithIcon('error', 'login', 'Login Failed', mess)
						}
					})
					.catch(err1 => {
						// console.log(err1)
						const errors = err1.graphQLErrors.map(error => error.extensions.code)
						let mess = ''
						if (errors[0] === '401') {
							mess = 'Username or Password is not correct'
						}

						if (errors[0] === '423') {
							mess = 'Your account is locked by Admin'
						}

						if (errors[0] === '404') {
							mess = 'Your account is not exist'
						}

						setLoading(false)

						openNotificationWithIcon('error', 'login', 'Login Failed', mess)
					})
			}
		})
	}

	const { form } = props
	const { getFieldDecorator } = form

	return (
		<>
			<Row id="layout-login">
				<Col
					xs={{ span: 24, offset: 0 }}
					sm={{ span: 16, offset: 8 }}
					md={{ span: 14, offset: 10 }}
					lg={{ span: 12, offset: 12 }}
					xl={{ span: 7, offset: 17 }}
				>
					<div id="components-form-demo-normal-login">
						<Form onSubmit={handleSubmit} className="login-form">
							<div className="login-form-header">
								<Title level={1}>Luncheon</Title>
							</div>
							<Form.Item>
								{getFieldDecorator('username', {
									valuePropName: 'defaultValue',
									initialValue: 'admin',
									rules: [
										{
											required: true,
											message: 'Please input your username!'
										}
									]
								})(
									<Input
										prefix={
											<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />
										}
										placeholder="username"
									/>
								)}
							</Form.Item>
							<Form.Item>
								{getFieldDecorator('password', {
									valuePropName: 'defaultValue',
									initialValue: '12345678',
									rules: [
										{
											required: true,
											message: 'Please input your Password!'
										},
										{
											min: 1,
											message: 'Your password must be between 1 and 8 characters'
										},
										{
											max: 8,
											message: 'Your password must be between 1 and 8 characters'
										}
									]
								})(
									<Input
										prefix={
											<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />
										}
										type="password"
										placeholder="Password"
									/>
								)}
							</Form.Item>
							<Form.Item>
								<Button
									type="primary"
									htmlType="submit"
									className="login-form-button"
									loading={loading}
									disabled={loading}
								>
									{!loading ? <Icon type="login" /> : null}
									Log in
								</Button>
							</Form.Item>
						</Form>
					</div>
				</Col>
			</Row>
		</>
	)
}

const USER_LOGIN = gql`
	mutation($input: LoginUserInput!) {
		login(input: $input) {
			token
			userPermissions {
				siteId
				siteName
				permissions {
					_id
					code
				}
			}
		}
	}
`

export default withApollo(
	inject('store')(observer(Form.create({ name: 'normal_login' })(Login)))
)
