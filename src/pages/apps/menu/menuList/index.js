import React, { useState } from 'react'
import { Card, Icon, Col, Row, Button, Modal, Form, Input } from 'antd'
import gql from 'graphql-tag'
import { HOCQueryMutation } from '../../../../components/shared/hocQueryAndMutation'
import openNotificationWithIcon from '../../../../components/shared/openNotificationWithIcon'

function MenuList(props) {
	const { data, form, mutate } = props
	const [visible, setVisible] = useState(false)

	async function deleteMenu(id) {
		Modal.confirm({
			title: 'Xóa menu',
			content: 'Bạn có chắc chắn xóa menu này?',
			onOk: async () => {
				await mutate
					.deleteMenu({
						variables: {
							id
						},
						refetchQueries: [
							{
								query: GET_MENUS_BY_SITE,
								variables: {
									siteId: props.siteId
								}
							}
						]
					})
					.then(
						res =>
							res &&
							openNotificationWithIcon(
								'success',
								'delete',
								'Xóa menu thành công',
								''
							)
					)
			}
		})
	}

	async function addMenu(e) {
		e.preventDefault()
		form.validateFieldsAndScroll(async err => {
			if (!err) {
				await mutate
					.addMenu({
						variables: {
							name: form.getFieldValue('name'),
							siteId: window.localStorage.getItem('currentsite')
						},
						refetchQueries: [
							{
								query: GET_MENUS_BY_SITE,
								variables: {
									siteId: props.siteId
								}
							}
						]
					})
					.then(res => {
						if (res) {
							openNotificationWithIcon(
								'success',
								'add',
								'Thêm menu thành công',
								''
							)
							form.resetFields()
							setVisible(false)
						}
					})
			}
		})
	}
	const { getFieldDecorator } = form
	return (
		<>
			{data.menusBySite.map(menu => (
				<Col
					key={menu._id}
					style={{ marginBottom: '20px' }}
					xs={{ span: 22, offset: 1 }}
					sm={{ span: 22, offset: 1 }}
					lg={{ span: 6, offset: 1 }}
				>
					<Card
						actions={[
							<Icon
								type="edit"
								onClick={() =>
									props.history.push(
										`/🥢/menu/detail/${props.siteId}/${menu._id}`
									)
								}
							/>,
							<Icon type="delete" onClick={() => deleteMenu(menu._id)} />
						]}
					>
						<p style={{ height: '1em', lineHeight: '1em' }}>{menu.name}</p>
					</Card>
				</Col>
			))}
			<Col xs={{ span: 8, offset: 8 }} lg={{ span: 8, offset: 8 }}>
				<Button ghost icon="plus" onClick={() => setVisible(true)} block>
					Thêm menu
				</Button>
				<Modal
					title="Thêm menu"
					cancelText="Đóng"
					visible={visible}
					okText="Lưu"
					onCancel={() => setVisible(false)}
					onOk={addMenu}
					centered
				>
					<Form>
						<Row>
							<Col span={20} offset={2}>
								<Form.Item>
									{getFieldDecorator('name', {
										rules: [{ required: true, message: 'Nhập tên menu' }],
										initialValue: ''
									})(
										<Input
											placeholder="Nhập tên menu"
											style={{ width: '90%' }}
										/>
									)}
								</Form.Item>
							</Col>
						</Row>
					</Form>
				</Modal>
			</Col>
		</>
	)
}

const GET_MENUS_BY_SITE = gql`
	query($siteId: String!) {
		menusBySite(siteId: $siteId) {
			_id
			name
		}
	}
`
const ADD_MENU = gql`
	mutation($name: String!, $siteId: String!) {
		createMenu(name: $name, siteId: $siteId)
	}
`

const DELETE_MENU = gql`
	mutation($id: String!) {
		deleteMenu(id: $id)
	}
`

export default HOCQueryMutation([
	{
		query: GET_MENUS_BY_SITE,
		options: props => ({
			variables: {
				siteId: props.siteId
			}
		})
	},
	{
		mutation: ADD_MENU,
		name: 'addMenu'
	},
	{
		mutation: DELETE_MENU,
		name: 'deleteMenu'
	}
])(Form.create()(MenuList))
