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
  = Failure
  | Loading
  | Success (String, List Words)


-- MODEL
type alias Model =
   { mot: String
   , donne:List String
   , sucess:Resultat
   , guess: String
   , reveal:Bool
   }


type alias Words =
    { word : String
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
  ( Model "" [] Loading "" False
  , Http.get
      { url = "http://localhost:8000/Mots/words.txt"
      , expect = Http.expectString GotText
      }
  )

-- UPDATE
type Msg
  = GotText (Result Http.Error String)
  | GotWord (Result Http.Error (List Words))
  | Num Int
  | Reload
  | Guess String
  | Reveal Bool

update : Msg -> Model -> (Model, Cmd Msg)
update msg model =
  case msg of
    GotText result ->
      case result of
        Ok fullText ->
          let
            items = String.split " " fullText
          in
          ( { model | donne = items }
          , Random.generate Num (Random.int 1 1000) )

        Err _ ->
          ({model|sucess=Failure}, Cmd.none)
    Num num ->  
      let
        mot = Maybe.withDefault "" (List.head (List.drop num model.donne))
      in
      ( { model | mot = mot }
      , Http.get
          { url = "https://api.dictionaryapi.dev/api/v2/entries/en/" ++ mot
          , expect = Http.expectJson GotWord descriptionDecoder
          }
      )
    GotWord result ->
        case result of
          Ok wordList ->
              ({model | sucess = Success (model.mot, wordList)}, Cmd.none)
          Err _ ->
              ({model | sucess = Failure }, Cmd.none)
    Reload ->
      init()
    Guess guess ->
        if guess == model.mot then
            ({model | guess = "Bravo, c'est gagné !!!"}, Cmd.none)
        else
            ({model | guess = guess}, Cmd.none)
    Reveal reveal ->
        ({model | reveal = reveal}, Cmd.none)


-- SUBSCRIPTIONS
subscriptions : Model -> Sub Msg
subscriptions model =
  Sub.none

view : Model -> Html Msg
view model =
  case model.sucess of
    Failure ->
      text "I was unable to load the word or its definition."

    Loading ->
      text "Loading..."

    Success (mot, words) ->
       div [] [
         text ("Guess the word : "++(if model.reveal then mot else " ")),
         div [] (List.map viewWordMeaning words),
         input [ onInput Guess, value model.guess ] [],
         div [] [ button [ onClick Reload ] [ text "Reload" ]
                , button [onClick (Reveal True)][text "show the answer"]
                ]
       ]

viewWordMeaning : Words -> Html Msg
viewWordMeaning words =
    div []
        [
           ul [] (List.map viewMeaning words.meanings)
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
descriptionDecoder : Decoder (List Words)
descriptionDecoder = Json.Decode.list wordDecoder

wordDecoder : Decoder Words
wordDecoder =
    map2 Words
        (field "word" string)
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