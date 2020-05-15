import { createAppContainer, createSwitchNavigator } from 'react-navigation';
import { createStackNavigator } from 'react-navigation-stack';

import Screen1 from './Screens/Method1';
import Screen2 from './Screens/Method2';


const StackNavigator = createStackNavigator({
  method1: Screen1,
  method2: Screen2,
},
  {
    defaultNavigationOptions: {

      headerShown: false,
    }
  })



export default createAppContainer(StackNavigator);