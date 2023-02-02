module Test2 exposing (..)

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
   { word: String
   , listeMots:List String
   , sucess:Resultat
   , devine: String
   , reveler:Bool
   }

type alias Mot =
    { mot : String
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
init : () -> (Model, Cmd Message)
init _ =
  ( Model "" [] Load "" False
  , Http.get
      { url = "http://localhost:8000/Mots Mots.txt"
      , expect = Http.expectString GotText
      }
  )

-- UPDATE
type Message
  = GotText (Result Http.Error String)
  | GotMot (Result Http.Error (List Mot))
  | Numero Int
  | Recharger
  | Devine String
  | Reveler Bool
 

update : Message -> Model -> (Model, Cmd Message)
update message model =
  case message of
    GotText result ->
      case result of
        Ok fullText ->
          let
            listeMots = String.split " " fullText
          in
          ( { model |listeMots = listeMots }
          , Random.generate Numero (Random.int 1 1000) )

        Err _ ->
          ({model|sucess=Fail}, Cmd.none)
    Numero numero ->  
      let
        word = Maybe.withDefault "" (List.head (List.drop numero model.listeMots))
      in
      ( { model | word = word }
      , Http.get
          { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ word
          , expect = Http.expectJson GotMot descriptionDecoder
          }
      )
    GotMot result ->
        case result of
          Ok motList ->
              ({model | sucess = Success (model.word, motList)}, Cmd.none)
          Err _ ->
              ({model | sucess = Fail }, Cmd.none)
    Recharger ->
      init()
    Devine devine ->
        if devine == model.word then
            ({model | devine = "Very good, you guessed it right !!!"}, Cmd.none)
        else
            ({model | devine = devine}, Cmd.none)
    Reveler reveler ->
        ({model | reveler = reveler}, Cmd.none)


-- SUBSCRIPTIONS
subscriptions : Model -> Sub Message
subscriptions model =
  Sub.none

view : Model -> Html Message
view model =
  case model.sucess of
    Fail ->
      text "I was unable to load the Word or its definition."

    Load ->
      text "Loading..."

    Success (mot, mots) ->
       div [] [
         text ("Guess the Mot : "++(if model.reveler then mot else " ")),
         div [] (List.map viewMotMeaning mots),
         input [ onInput Devine, value model.devine ] [],
         button [ onClick  Recharger ] [ text "Reload" ],
         button [onClick (Reveler True)][text "Show the answer"]
       ]

viewMotMeaning : Mot -> Html Message
viewMotMeaning mot1 =
    div []
        [
           ul [] (List.map viewMeaning mot1.meanings)
        ]

viewMeaning : Meaning -> Html Message
viewMeaning meaning =
    li []
        [ text meaning.partOfSpeech        
        , ul [] (List.map viewDefinition meaning.definitions)
        ]

viewDefinition : Definition -> Html Message
viewDefinition def =
    li [] [ text def.definition ]

-- Decoders
descriptionDecoder : Decoder (List Mot)
descriptionDecoder = Json.Decode.list motDecoder

motDecoder : Decoder Mot
motDecoder =
    map2 Mot
        (field  "mot" string)
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