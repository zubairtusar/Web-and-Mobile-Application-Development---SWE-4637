import React, { useState, useEffect } from "react";
import {
    View,
    StyleSheet,
    FlatList,
    ActivityIndicator,
} from "react-native";
import {
    Card,
    Button,
    Input,
} from "react-native-elements";
import PostCard from "./../components/PostCard";
import HeaderHome from "./../components/HeaderHome";
import { Entypo } from "@expo/vector-icons";
import { AuthContext } from "../providers/AuthProvider";
import { useNetInfo } from "@react-native-community/netinfo"

import * as firebase from "firebase";
import "firebase/firestore";

const HomeScreen = (props) => {
    // const netinfo = useNetInfo();
    // if(netinfo.type!='unknown' && !netinfo.isInternetReachable){
    //     alert("No Internet");
    // }
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [input, setInput] = useState("");

    const loadPosts = async () => {
        setLoading(true);
        firebase.firestore().collection('posts').orderBy("created_at", "desc").onSnapshot((querySnapshot)=>{
            let temp_posts = []
            querySnapshot.forEach((doc)=>{
                temp_posts.push({
                    id: doc.id,
                    data: doc.data(),
                });
            });
            setPosts(temp_posts);
            setLoading(false);
        }).catch((error)=>{
            setLoading(false);
            alert(error);
        });
    };

    useEffect(() => {
        loadPosts();
        console.log(props);
    }, []);

    if (!loading) {
        return (
            <AuthContext.Consumer>
                {(auth) => (
                    <View style={styles.viewStyle}>
                        <HeaderHome
                            DrawerFunction={()=>{
                                props.navigation.toggleDrawer();
                            }}
                        />
                        <Card>
                            <Input
                                placeholder="What's On Your Mind?"
                                leftIcon={<Entypo name="pencil" size={24} color="black" />}
                                on onChangeText={(currentInput)=>{
                                    setInput(currentInput)
                                }}
                            />
                            <Button title="Post" type="outline" onPress={function () {
                                if(input == ""){
                                    alert("Filed is Empty!");
                                }else{
                                    setLoading(true);
                                    firebase.firestore().collection('posts').add({
                                        userId: auth.CurrentUser.uid,
                                        body: input,
                                        author: auth.CurrentUser.displayName,
                                        created_at: firebase.firestore.Timestamp.now(),
                                        likes: [],
                                        comments: [],
                                    }).then(() => {
                                        setLoading(false);
                                        alert("Post was created successfully!");
                                    }).catch((error) => {
                                        setLoading(false);
                                        alert(error);
                                    });
                                }
                            }} />
                        </Card>

                        <FlatList
                            data={posts}
                            renderItem={function ({ item }) {
                                return (
                                    <PostCard
                                        author={item.data.author}
                                        body={item.data.body}
                                        postId={item.id}
                                        navigation={props.navigation}
                                    />
                                );
                            }}
                        />
                    </View>
                )}
            </AuthContext.Consumer>
        );
    } else {
        return (
            <View style={{ flex: 1, justifyContent: "center" }}>
                <ActivityIndicator size="large" color="blue" animating={true} />
            </View>
        );
    }
};

const styles = StyleSheet.create({
    textStyle: {
        fontSize: 30,
        color: "blue",
    },
    viewStyle: {
        flex: 1,
    },
});

export default HomeScreen;