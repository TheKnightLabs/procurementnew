import React, {
	Component
} from 'react';
import {
	TouchableOpacity,
	StyleSheet,
	Image,
	Alert,
	ToastAndroid
} from 'react-native';
import ListShow from './ListShow';
import Order from './Order';
import Autocomplete from 'react-native-autocomplete-input';
import allData from './data';
import {
	Container,
	Header,
	Title,
	Content,
	Card,
	CardItem,
	Button,
	Item,
	Input,
	Left,
	Right,
	Body,
	Icon,
	Text,
	Subtitle,
	FooterTab,
	Footer,
	Badge

} from 'native-base';
const key = Math.random().toString(36).substr(2);
import * as firebase from 'firebase';
export default class MainScreen extends Component {

	constructor(props) {

		super(props);
		
		this.state = {
			isLoading: false,
			text: '',
			selected: false,
			amount: '', 
			weight: '',
			rate: '',
			marketrate: '',
			totalAmt:0,
			pList: [],
			vList: false,
			orderList:false,
			num:0
		};

	}


	componentWillMount(){
	
		let that = this;
		firebase.database().ref('orders/').on('value', function(snapshot) {
			let data = snapshot.val();
			if(data==null){
				that.setState({num:0})
			}else{
			let num=Object.keys(snapshot.val()).length;
			that.setState({num:num});}
		});
	}
	
	addtoList() {
		
		const {
			amount,
			weight,
			selected,
			rate,
			marketrate,
		} = this.state;
		this.setState((prevState) => {
			prevState.pList.push({
				amount: amount,
				weight: weight,
				selected: selected,
				rate: rate,
				marketrate:marketrate,
				uid:key,
				'UserID': firebase.auth().currentUser.email
			});
			return prevState;
		});
		this.setState({
			amount:'',
			weight:'',
			rate:'',
			marketrate: '',
			
		});
		ToastAndroid.show('Updated', ToastAndroid.SHORT)
	}
	deleteListData(rowToDelete,rowData) {
		let {totalAmt}=this.state
		this.setState((prevState) => {
			prevState.pList = prevState.pList.filter((dataname) => {
				if (dataname.uid !== rowToDelete) {
					return dataname;
				}
			});
			return prevState;
		});
		totalAmt=totalAmt-parseFloat(rowData);
		console.log(rowData)
		this.setState({totalAmt});
	}

	showList() {
 
		return <ListShow/>;
	}

	validator() {
		let {
			amount,
			weight,
			rate,
			selected,
			totalAmt
		} = this.state;
		if (amount == '' && weight != '' && rate != '') {
			let result = parseFloat(weight) * rate;
			result = result.toFixed(2);
			amount = "" + result
		} else if (weight == '' && amount != '' && rate != '') {
			let result = parseFloat(amount) / rate;
			result = result.toFixed(2);
			weight = "" + result
		} else if (rate == '' && amount != '' && weight != '') {
			let result = parseFloat(amount) / weight;
			result = result.toFixed(2);
			rate = "" + result
		} else if(selected== "Bhaada" || selected=="Palledari" || selected=="Jalpan")
		{
			amount=amount
			weight=""
			rate=""
		}
		else
		{
				return Alert.alert('Error', 'Please check the data');
		}
		totalAmt=totalAmt+parseFloat(amount)
		this.setState({totalAmt});
		console.log(totalAmt);
		this.setState({
			amount,
			weight,
			rate
		},
		() => this.addtoList());
	
	}
	logout() {
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
		}, function(error) {
			Alert.alert('Error', 'Temporary Error, 400');
		});
	}
	newSession(){
		this.setState({pList:[]});
	}
	
	renderSelected(item) {
		
		const {
			amount,
			weight,
			selected,
			rate,
			marketrate,
			uid
		} = this.state;
		if (!!!item) {
			return null;
		}
		item = allData.filter((e) => e.label == item)[0];
		return <Card>
			<CardItem cardBody>
				{item.image && <Image source={item.image} style={style.cardImage} />}
			</CardItem>
			<CardItem>
				<Left>
					<Text style={style.inputTextStyle}>{item.label}</Text>
				</Left>
			</CardItem>
			<CardItem cardBody>
				<Content style={
					{
						padding: 10,
						borderTopWidth: 1,
						borderColor: "#dadada"
					}
				}>
					<Item>
						<Icon type="FontAwesome" name="money" />
						<Input
							onChangeText={amount => this.setState({ amount })}
							value={amount}
							keyboardType="numeric"
							placeholder="Amount" />
					</Item>
					<Item>
						<Icon name="ios-pricetag" />
						<Input
							onChangeText={rate => this.setState({ rate })}
							value={rate}
							keyboardType="numeric" placeholder="Rate" />
					</Item>
					<Item>
						<Icon type="MaterialCommunityIcons" name="weight-kilogram" />
						<Input
							onChangeText={weight => this.setState({ weight })}
							value={weight}
							keyboardType="numeric" placeholder="Weight" />
					</Item>
					<Item>
						<Icon  name="ios-pricetag" />
						<Input
							onChangeText={marketrate => this.setState({ marketrate })}
							value={marketrate}
							keyboardType="numeric" placeholder="Market Rate" />
					</Item>
				</Content>
			</CardItem>
			
			
			
			<CardItem>
		<Content>
					<Button block info onPress={() => this.validator()}>
						<Text>Procure Item</Text>
					</Button>
				</Content>
				
			</CardItem>
			<CardItem>
			<Content style={
					{
						padding: 10,
						borderTopWidth: 1,
						borderColor: "#dadada"
					}
			}> 
			<Button block danger onPress={()=>this.setState({vList:true})}>
						<Text>Generate Report</Text>
					</Button>
			</Content>
			</CardItem>
		</Card>
		;
	}
	render() {
		if(this.state.orderList){
			return <Order back={()=> this.setState({orderList:false})} list={this.state.pList} number={this.state.num} />
		}else if (this.state.vList) {
			return <ListShow list={this.state.pList} 
			back={()=>this.setState({vList:false})} 
			delete={(rowToDelete,rowData)=>this.deleteListData(rowToDelete,rowData)} 
			total={this.state.totalAmt}
			newSession={()=>this.setState({pList:[],totalAmt:0})} />;
		} else {

			const {
				text,
				selected
			} = this.state;
			let data = [];
			if (text.length) {
				data = allData.filter((e) => e.label.toLowerCase().startsWith(text.toLowerCase())).map((e) => e.label);
			}
			return (
				<Container>
				<Header>
					<Body>
						<Title>Procurement Service</Title>
						<Subtitle>Meri Mandi</Subtitle>
					</Body>
					<Right>
						<Button hasText transparent onPress={this.logout}>
							<Text>Logout</Text>
						</Button>
					</Right>
				</Header>
				<Content style={
					{
						padding: 10
					}
				}>
					<Autocomplete
						data={data}
						onChangeText={text => text && this.setState({ text })}
						renderItem={item => (
							<TouchableOpacity onPress={() => this.setState({ text: item, selected: item })}>
								<Text style={style.inputTextStyle}>{item}</Text>
							</TouchableOpacity>
						)}
					/>
					{this.renderSelected(selected)}
				</Content>
				<Footer>
         		 <FooterTab>
            		<Button vertical>
              		<Icon name="apps" />
              		<Text>Main</Text>
            		</Button>
            		<Button badge vertical onPress={()=> this.setState({orderList:true})}>
					<Badge><Text>{this.state.num}</Text></Badge>
              		<Icon type="FontAwesome" name="shopping-cart" />
             		<Text>Orders</Text>
           			</Button>
					</FooterTab>
       				</Footer>
			</Container>
			);
		}
	}

}
const style = StyleSheet.create({
	listText: {
		fontSize: 14
	},
	timeStampStyle: {
		fontSize: 16
	},
	inputTextStyle: {
		fontSize: 22,

	},
	cardImage: {
		height: 200,
		width: null,
		flex: 1
	}
})
