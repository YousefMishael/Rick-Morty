import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Text,
} from "react-native";
import { getDetails } from "../../Utils/ApiServices";
import EpisodeSkeleton from "./EpisodeSkeleton";
import { getSubDetails } from "../../Utils/ApiServices";
import { win } from "../../Utils/AppUtils";
import { MaterialIcons, Fontisto } from "@expo/vector-icons";
import moment from "moment";

function Episode(props) {
  //prettier-ignore
  const [episodeUrl, ] = useState(props.route.params.url);
  const [episode, setEpisode] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [details, setDetails] = useState([]);

  //gettin episode details from api using url from props from home screen
  useEffect(() => {
    try {
      async function getEpisode() {
        const result = await getDetails(episodeUrl);
        setEpisode(result);
      }
      getEpisode();
    } catch (error) {
      console.error(error);
    }
  }, []);

  //getting character images from api after getting details of episode
  useEffect(() => {
    setIsLoading(false);
    let isMounted = true;

    if (typeof episode.characters !== "undefined")
      getSubDetails(episode.characters).then((res) => {
        if (isMounted) setDetails(res);
      });

    return () => {
      isMounted = false;
    };
  }, [episode]);

  //navigation to character screen when press on character image
  const openCharacterScreen = (url) => {
    props.navigation.push("Character", { url: url });
  };

  //character images flatlist callbacks
  const keyExtractor = useCallback((item) => item.id.toString());
  const renderItem = useCallback(({ item }) => (
    <View style={style.imageContainer} onStartShouldSetResponder={() => true}>
      <TouchableOpacity onPress={openCharacterScreen.bind(this, item.url)}>
        <Image style={style.characterImage} source={{ uri: item.image }} />
      </TouchableOpacity>
    </View>
  ));

  return (
    <View style={style.container}>
      {isLoading ? (
        <EpisodeSkeleton />
      ) : (
        <View style={{ minHeight: "100%" }}>
          <ScrollView>
            <View style={style.charactersContainer}>
              <FlatList
                data={details}
                horizontal
                key={"#"}
                maxToRenderPerBatch={4}
                windowSize={4}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
              />
            </View>
            <View style={style.detailsContainer}>
              <View style={style.detailsItem}>
                <MaterialIcons name="movie" size={24} color="black" />
                <Text style={style.episodeName}> {episode.name}</Text>
              </View>
              <View style={style.detailsItem}>
                <MaterialIcons name="local-movies" size={24} color="black" />
                <Text> {episode.episode}</Text>
              </View>
              <View style={style.detailsItem}>
                <MaterialIcons name="live-tv" size={24} color="black" />
                <Text style={style.detailsItem}>
                  {" "}
                  Air date: {episode.air_date}
                </Text>
              </View>
              <View style={style.detailsItem}>
                <Fontisto name="date" size={24} color="black" />
                <Text style={style.detailsItem}>
                  {" "}
                  Created date:{" "}
                  {moment(episode.created).format("MMMM DD, YYYY hh:mm a")}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "column",
    minHeight: "100%",
  },
  charactersContainer: {
    marginTop: 10,
  },
  imageContainer: {
    width: win.width - 10,
    marginHorizontal: 5,
  },
  characterImage: {
    width: "100%",
    aspectRatio: 1,
    borderColor: "black",
    borderWidth: 1,
    borderRadius: 5,
  },
  detailsContainer: {
    marginTop: 10,
    padding: 10,
  },
  episodeName: {
    fontWeight: "bold",
    fontSize: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
  },
  detailsItem: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
});

export default React.memo(Episode);
