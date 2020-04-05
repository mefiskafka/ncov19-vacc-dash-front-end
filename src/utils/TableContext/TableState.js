import React, { createContext, useReducer, useEffect } from "react";

import {
	IS_LOADING,
	GET_TABLE_SUCCESS,
	GET_TABLE_ERROR,
	GET_TRIALS_SUCCESS,
	GET_TRIALS_ERROR,
	SET_FILTER_SUCCESS,
	SET_FILTER_ERROR,
	FILTER_BY_ON_CLICK_SUCCESS,
	FILTER_BY_ON_CLICK_ERROR,
	GET_MAP_SUCCESS,
	GET_MAP_ERROR,
	GET_TRIAL_BY_COUNTRY_SUCCESS,
	GET_TRIAL_BY_COUNTRY_ERROR,
} from "./types";
import { loadState, saveState } from "../localStorage";
import { axiosWithAuth, client } from "../axiosWithAuth";
import { reducer } from "./reducers";

export const TableContext = createContext();

/* 
GOAL: 
	Create Global state with React Context 
	Create communication with backend server with CRUD operations

USAGE: 
	Wrap ContextState in app to initialize global state
	import useContext in component wherever needed
	import {DatatContext} from './path to State'
	create variable 
		const {state, or method-function, or both} = useContext({DataContext})

RETURNS: 
	Updated state

*/
export const TableState = (props) => {
	// create and initial state
	const initialState = {
		error: "",
		isLoading: false,
		table: [],
		trials: [],
		map: [],
		phase: [],
	};

	// get updated state from localStorage
	const localState = loadState("table");

	// use reducer on local state or start fresh with initial state
	const [state, dispatch] = useReducer(reducer, localState || initialState);

	// save state to localstorage on page render
	useEffect(() => {
		saveState("table", state);
	}, [state]);

	// method that will dispatch success or error
	// send CRUD operation to backend server
	const getTable = async () => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			const table = await client().get("/api/totals");
			dispatch({ type: GET_TABLE_SUCCESS, payload: table.data });
		} catch (e) {
			console.log("error", e.message);
			dispatch({ type: GET_TABLE_ERROR, payload: e.response });
		}
	};
	const getTrials = async () => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			const vaccines = await client().get(`/api/trials?type=vaccines`);
			const treatments = await client().get(
				`/api/trials?type=treatments`
			);
			const alternatives = await client().get(
				`/api/trials?type=alternatives`
			);
			const getAll = {
				...vaccines.data,
				...treatments.data,
				...alternatives.data,
			};
			dispatch({ type: GET_TRIALS_SUCCESS, payload: getAll });
		} catch (e) {
			console.log("error", e.message);
			{
				dispatch({ type: GET_TRIALS_ERROR, payload: e.response });
			}
		}
	};
	const mapFilterByCountry = async (country) => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			const res = await client().get(
				`/api/totals?countries=${country.properties.name}`
			);
			console.log("res", res);
			dispatch({ type: SET_FILTER_SUCCESS, payload: res.data });
		} catch (e) {
			console.log("error", e);
			{
				dispatch({ type: SET_FILTER_ERROR, payload: e.response });
			}
		}
	};
	const filterByOnClick = async (data) => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			dispatch({ type: FILTER_BY_ON_CLICK_SUCCESS, payload: data });
		} catch (e) {
			console.log("error", e);
			{
				dispatch({
					type: FILTER_BY_ON_CLICK_ERROR,
					payload: e.response,
				});
			}
		}
	};
	const getMap = async () => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			const res = await client().get(`/api/map`);
			dispatch({ type: GET_MAP_SUCCESS, payload: res.data });
		} catch (e) {
			console.log("error getting map", e);
			{
				dispatch({ type: GET_MAP_ERROR, payload: e.response });
			}
		}
	};
	const getTrialByCountry = async (type, country) => {
		dispatch({ type: IS_LOADING, payload: true });
		try {
			const res = await client().get(
				`/api/trials?type=${type}&countries=${country}`
			);
			console.log("countryTrial", res);
			dispatch({ type: GET_TRIAL_BY_COUNTRY_SUCCESS, payload: res.data });
		} catch (e) {
			console.log("error", e);
			{
				dispatch({
					type: GET_TRIAL_BY_COUNTRY_ERROR,
					payload: e.response,
				});
			}
		}
	};

	// Provider values are in function or state
	return (
		<TableContext.Provider
			value={{
				error: state.error,
				table: state.table,
				map: state.map,
				trials: state.trials,
				filter: state.filter,
				isLoading: state.isLoading,
				getTable,
				getTrials,
				getMap,
				mapFilterByCountry,
				filterByOnClick,
				getTrialByCountry,
			}}
		>
			{props.children}
		</TableContext.Provider>
	);
};
