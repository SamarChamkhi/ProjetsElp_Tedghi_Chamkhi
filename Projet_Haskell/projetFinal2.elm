module Test exposing (..)

import Browser
import Http
import Html as H exposing (Html)
import Html exposing (..)
import Html.Events exposing (onClick)
import Random
import Task
import Json.Decode exposing (Decoder, map2, list, field, string)
import Html.Attributes exposing (value)
import Html.Events exposing (onInput)

-- MAIN
main =
  Browser.element
    { init = init
    , update = update
    , subscriptions = subscriptions
    , view = view
    }

-- MODEL
type Resultat
  = Fail
  | Load
  | Success (String, List Mot)


-- MODEL
type alias Model =
   {mot: String, listeMots:List String, sucess:Resultat, devine: String, reveler:Bool}


type alias Mot =
    { Mot : String
    , meanings : List Meaning
    }
type alias Meaning =
    { partOfSpeech : String
    , definitions : List Definition
    }
type alias Definition =
    { definition : String
    }


-- INIT
init : () -> (Model, Cmd Msg)
init _ =
  ( Model "" [] Load "" False
  , Http.get
      { url = "http://localhost:8000/Mots Mots.txt"
      , expect = Http.expectString GotText
      }
  )

-- UPDATE
type Msg
  = GotText (Result Http.Error String)
  | Go Mot (Result Http.Error (List Mot))
  | Num Int
  | Reload
  | devine String
  | reveler Bool

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotText result ->
      case result of
        Ok fullText ->
          let
            listeMots = String.split " " fullText
          in
          ( { model | listeMots = listeMots }
          , Random.generate Num (Random.int 1 1000) )

        Err _ ->
          ({model|sucess=Fail}, Cmd.none)
    Num num ->  
      let
        mot = Maybe.withDefault "" (List.head (List.drop num model.listeMots))
      in
      ( { model | mot = mot }
      , Http.get
          { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ mot
          , expect = Http.expectJson Go Mot descriptionDecoder
          }
      )
    Go Mot result ->
        case result of
          Ok MotList ->
              ({model | sucess = Success (model.mot, MotList)}, Cmd.none)
          Err _ ->
              ({model | sucess = Fail }, Cmd.none)
    Reload ->
      init()
 devine ->
        if devine == model.mot then
            ({model | devine = "Bravo, c'est gagné !!!"}, Cmd.none)
        else
            ({model | devine = devine}, Cmd.none)
    reveler reveler ->
        ({model | reveler = reveler}, Cmd.none)


-- SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

view : Model -> Html Msg
view model =
  case model.sucess of
    Fail ->
      text "I was unable to load the Mot or its definition."

    Load ->
      text "Load..."

    Success (mot, Mots) ->
       div [] [
         text ( devine the Mot : "++(if model.reveler then mot else " ")),
         div [] (List.map vie MotMeaning Mots),
         input [ onInput devine, value model devine ] [],
         button [ onClick Reload ] [ text "Reload" ],
         button [onClick (reveler True)][text "show the answer"]
       ]

vie MotMeaning : Mot -> Html Msg
vie MotMeaning Mot =
    div []
        [
           ul [] (List.map viewMeaning Mot.meanings)
        ]

viewMeaning : Meaning -> Html Msg
viewMeaning meaning =
    li []
        [ text meaning.partOfSpeech        
        , ul [] (List.map viewDefinition meaning.definitions)
        ]

viewDefinition : Definition -> Html Msg
viewDefinition def =
    li [] [ text def.definition ]

-- Decoders
descriptionDecoder : Decoder (List Mot)
descriptionDecoder = Json.Decode.list MotDecoder
 MotDecoder : Decoder MotDecoder =
    map2 Mot
        (field  Mot" string)
        (field "meanings" (Json.Decode.list meaningDecoder))

meaningDecoder : Decoder Meaning
meaningDecoder =
    map2 Meaning
        (field "partOfSpeech" string)
        (field "definitions" (Json.Decode.list definitionDecoder))

definitionDecoder : Decoder Definition
definitionDecoder =
    Json.Decode.map Definition
        (field "definition" string)