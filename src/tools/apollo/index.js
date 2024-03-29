import { ApolloClient } from 'apollo-client'
import { InMemoryCache } from 'apollo-cache-inmemory'
import { ApolloLink, split } from 'apollo-link'
import { HttpLink } from 'apollo-link-http'
import { onError as OnError } from 'apollo-link-error'
import { setContext } from 'apollo-link-context'
import { WebSocketLink } from 'apollo-link-ws'
import { getMainDefinition } from 'apollo-utilities'
import store from '../mobx'

// const domain = 'devcloud3.digihcs.com'
// const port = '11098'

const httpLink = new HttpLink({
	uri: 'https://belu.herokuapp.com/graphql'
	// uri: `http://${domain}:${port}/graphql`
})

const wsLink = new WebSocketLink({
	uri: 'wss://belu.herokuapp.com/graphql',
	// uri: `ws://${domain}:${port}/graphql`,
	options: {
		reconnect: true
	}
})

const link = split(
	// split based on operation type
	({ query }) => {
		const definition = getMainDefinition(query)
		return (
			definition.kind === 'OperationDefinition' &&
			definition.operation === 'subscription'
		)
	},
	wsLink,
	httpLink
)

const errorLink = new OnError(({ graphQLErrors, networkError, operation }) => {
	if (graphQLErrors) {
		graphQLErrors.forEach(({ message, locations, path, extensions }) => {
			console.log(
				`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}, Code: ${extensions.code}`
			)
			if (extensions.code === '498') {
				store.authStore.logout()
				window.location.pathname = '/login'
			}
		})
	}
	if (networkError) {
		console.log(
			`[Network error ${operation.operationName}]: ${networkError.message}`
		)
	}
})

const authLink = setContext((_, { headers }) => {
	// get the authentication token from local storage if it exists
	const token = window.localStorage.getItem('access-token')
	const currentsite = window.localStorage.getItem('currentsite')
	// return the headers to the context so httpLink can read them
	return {
		headers: {
			...headers,
			token: token || '',
			currentsite: currentsite || ''
		}
	}
})

const defaultOptions = {
	// watchQuery: {
	// 	fetchPolicy: 'cache-and-network',
	// 	errorPolicy: 'ignore'
	// },
	// query: {
	// 	fetchPolicy: 'network-only',
	// 	errorPolicy: 'all'
	// },
	// mutate: {
	// 	errorPolicy: 'all'
	// }
}

const client = new ApolloClient({
	// cache: new InMemoryCache(),
	defaultOptions,
	cache: new InMemoryCache().restore(window.__APOLLO_STATE__),
	link: ApolloLink.from([errorLink, authLink, link]),
	ssrForceFetchDelay: 100
})

export default client
